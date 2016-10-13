let Fs = require("fs");
let Path = require("path");

export module UtilPath {

  /**
   * Test if a path is contained in atom projects paths
   */
  /*private*/ function containsInAtomProject(path: string): boolean {
    return atom.project.contains(Path.join(path, Path.sep));
  }

  /**
   * Return the minimal depth for less file starting from the given path
   */
  /*private*/ function getLessFileMinDepth(path: string): number {
    let depth: number = -1;
    let nextPaths: string[] = [path];
    let paths: string[];
    let files: string[];

    let currentPath: string;

    while (nextPaths.length > 0) {
      depth++;
      paths = nextPaths;
      nextPaths = [];
      while (paths.length > 0) {
        currentPath = paths.pop();
        files = Fs.readdirSync(currentPath);

        for (let f = 0; f < files.length; f++) {
          if (Path.extname(files[f]) == ".less") {
            return depth;
          }
          else if (Fs.statSync(Path.join(currentPath, files[f]).isDirectory())) {
            nextPaths.push(Path.join(currentPath, files[f]));
          }
        }
      }
    }

    return -1;
  }

  /**
   * Test if a file exists
   */
  export function exists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        resolve(existsSync(path));
      }
      catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Synchronous version of *fileExists()*
   */
  export function existsSync(path: string): boolean {
    try {
      Fs.accessSync(path, Fs.F_OK);
      return true;
    }
    catch (error) {
      return false;
    }
  }

  /**
   * Look up in folder hierarchy until `lessconfig.json` is found, or get out of the project directory.
   */
  export function findConfigFileForPath(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        resolve(findConfigFileForPathSync(path));
      }
      catch(error) {
        reject(error);
      }
    });
  }

  /**
   * Synchronous version of *findConfigFileForPath()*
   */
  export function findConfigFileForPathSync(path: string): string {
    let filepath: string = undefined;

    if (Fs.statSync(path).isFile()) {
      path = Path.dirname(path);
    }

    while (filepath == undefined && containsInAtomProject(path)) {
      if (existsSync(Path.join(path, "lessconfig.json"))) {
        filepath = Path.join(path, "lessconfig.json");
      }
      path = Path.dirname(path);
    }

    return filepath;
  }

  /**
   * Return the min depth for less files, from the given path.
   */
  export function getMinDepthOfLessFiles(path: string): number {
    let nextPaths: string[] = [path];
    let depth = -1;

    let paths: string[], files: string[], currentPath: string;

    while (nextPaths.length > 0) {
      paths = nextPaths;
      nextPaths = [];
      depth++;
      do {
        currentPath = paths.pop();
        files = Fs.readdirSync(currentPath);
        for (let f = files.length - 1; f >= 0; f--) {
          if (Fs.statSync(Path.join(currentPath, files[f])).isDirectory()) {
            nextPaths.push(Path.join(currentPath, files[f]));
          }
          else if (Path.extname(files[f]) == ".less") {
            return depth;
          }
        }
      } while (paths.length > 0)
    }

    return -1;
  }

  /**
   * Relativize absolute path from project path
   */
  export function getRelativeFilePath(filepath: string): string {
    if (!Path.isAbsolute(filepath)) {
      return filepath;
    }

    let relativeFilepath = Path.dirname(filepath);
    while (containsInAtomProject(Path.dirname(relativeFilepath))) {
      relativeFilepath = Path.dirname(relativeFilepath);
    }
    return Path.relative(relativeFilepath, filepath);
  }

  /**
   * Creates directory recursively
   */
  export function mkdir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        mkdirSync(path);
        resolve();
      }
      catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Synchronous version of *mkdir()*
   */
  export function mkdirSync(path: string): void {
    let paths: string[] = [];

    while (!existsSync(path)) {
      paths.push(Path.basename(path));
      path = Path.dirname(path);
    }

    while (paths.length > 0) {
      path = Path.join(path, paths.pop());
      Fs.mkdirSync(path);
    }
  }
}
