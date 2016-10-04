let Fs = require("fs");
let Path = require("path");

export module UtilPath {

  /** Creates directory recursively */
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

  /** Synchronous version of *mkdir()* */
  export function mkdirSync(path: string): void {
    let paths: string[] = [];
    let stop: boolean = false;

    while (!stop) {
      try {
        Fs.accessSync(path, Fs.F_OK);
        stop = true;
      }
      catch (error) {
        paths.push(Path.basename(path));
        path = Path.dirname(path);
      }
    }

    while (paths.length > 0) {
      path = Path.join(path, paths.pop());
      Fs.mkdirSync(path);
    }
  }

  /** Look up in folder hierarchy until `lessconfig.json` is found, or get out of the project directory. */
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

  /** Synchronous version of *findConfigFileForPath()* */
  export function findConfigFileForPathSync(path: string): string {
    let filepath: string = undefined;

    if (Fs.statSync(path).isFile()) {
      path = Path.dirname(path);
    }

    while (filepath == undefined && atom.project.contains(path)) {
      try {
        Fs.accessSync(Path.join(path, "lessconfig.json"), Fs.F_OK);
        filepath = Path.join(path, "lessconfig.json");
      }
      catch (error) {
        path = Path.dirname(path);
      }
    }

    if (filepath == undefined && (<any>atom.project).getPaths().indexOf(path) > -1) {
      try {
        Fs.accessSync(Path.join(path, "lessconfig.json"), Fs.F_OK);
        filepath = Path.join(path, "lessconfig.json");
      }
      catch (error) {
      }
    }

    return filepath;
  }

  /** Relativize absolute path from project path */
  export function getRelativeFilePath(filepath: string): string {
    if (!Path.isAbsolute(filepath)) {
      return filepath;
    }
    let relativeFilepath = Path.dirname(filepath);
    while (atom.project.contains(Path.dirname(relativeFilepath))) {
      relativeFilepath = Path.dirname(relativeFilepath);
    }
    return Path.relative(relativeFilepath, filepath);
  }
}
