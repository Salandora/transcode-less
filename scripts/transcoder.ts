import Fs = require("fs");
import Less = require("less");
import Path = require("path");

import {LessConfig} from "./lessconfig";
import {DetailedError} from "./error";

/** Create `dirpath` recursively */
function mkdir(dirpath: string): boolean {

  let parts: string[] = [];
  let path: string = dirpath;

  while (atom.project.contains(Path.dirname(path))) {
    parts.push(Path.basename(path));
    path = Path.dirname(path);
  }

  parts.forEach(part => {
    path = Path.join(path, part);
    try {
      Fs.accessSync(path, Fs.F_OK);
    }
    catch (exception) {
      Fs.mkdirSync(path);
    }
  });

  try {
    return Fs.statSync(path).isDirectory();
  }
  catch (exception) {
    return false;
  }
}

/** Relativize absolute path from project path */
function getRelativeFilePath(filepath: string): string {
  if (!Path.isAbsolute(filepath)) {
    return filepath;
  }
  let relativeFilepath = Path.dirname(filepath);
  while (atom.project.contains(Path.dirname(relativeFilepath))) {
    relativeFilepath = Path.dirname(relativeFilepath);
  }
  return Path.relative(relativeFilepath, filepath);
}

/** Render less from the given css string */
function render(filepath: string, input: string, configuration: LessConfig.Options): Promise<Less.RenderOutput> {
  return new Promise<Less.RenderOutput> ((resolve, reject) => {
  configuration.loadOptions()
    .then((options: Less.Options) => {
      (<any>options).paths = (<any>options).paths || [ Path.dirname(filepath) ];
      Less.render(input, options)
        .then(resolve)
        .catch(reject);
    });
  });
}

/** Transcode less file into css file */
export function transcodeFile(filepath: string, configuration: LessConfig.Options = undefined): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (configuration == undefined) {
      configuration = LessConfig.Options.getOptionForLessFile(filepath);
    }

    let outDir = Path.dirname(filepath);
    if (configuration.outDir) {
      outDir = Path.resolve(Path.dirname(configuration.getFilepath()), configuration.outDir);
    }
    let cssFile = Path.join(outDir, Path.basename(filepath).replace(/\.less$/, ".css"));
    let mapFile = Path.join(outDir, Path.basename(filepath).replace(/\.less$/, ".css.map"));

    if (!mkdir(outDir)) {
      reject(<DetailedError>{
        name: "TL:MKDIR",
        message: "Out directory cannot be create",
        detail: `directory: ${getRelativeFilePath(filepath)}`,
        stack: "transcoder.ts:71"
      });
    }
    else {
      // Read less file content
      Fs.readFile(filepath, (error: NodeJS.ErrnoException, data: Buffer) => {
        if (error) {
          // Reject with DetailError
          reject(<DetailedError>{
            name: "TL:READFL",
            message: error.message,
            detail: `cannot read file: ${getRelativeFilePath(filepath)}`,
            stack: error.stack
          });
        }
        else {
          // Call less.render()
          render(filepath, data.toString(), configuration)
            .then((output: Less.RenderOutput) => {
              if (output.css.length > 0) {
                // Write css to file
                Fs.writeFileSync(cssFile, output.css);
                if (configuration.options.sourceMap) {
                  Fs.writeFileSync(mapFile, output.map);
                }
                resolve(Path.relative(Path.dirname(filepath), cssFile));
              }
            })
            .catch((error: Less.RenderError) => {
              // Reject with DetailError
              reject(<DetailedError>{
                name: "TL:PARSE",
                message: error.message,
                detail: `less rendering failed: ${getRelativeFilePath(filepath)}`,
                stack: `${error.filename}:${error.line} ${error.type}`
              });
            });
        }
      });
    }
  });
}

/** Transcode all less files in the project */
export function transcodeAll(configuration: LessConfig.Options = undefined): Promise<string> {
  return new Promise<string>((resolve, reject) => {

    let paths: string[] = <string[]>(<any>atom.project).getPaths();
    let path: string;
    let files: string[] = [];
    let filepath: string;
    var stat: Fs.Stats;

    // looks for lessconfig.json
    do {
      path = paths.pop();
      Fs.readdirSync(path).forEach((file: string) => {
        filepath = Path.join(path, file);
        stat = Fs.statSync(filepath);
        if (stat.isDirectory()) {
          paths.push(filepath);
        }
        else if (stat.isFile() && Path.basename(filepath) == "lessconfig.json") {
          files.push(filepath);
        }
      });
    } while (paths.length > 0);

    // looks for *.less files from directories containing a lessconfig.json
    paths = files.map(file => Path.dirname(file));
    files = [];
    do {
      path = paths.pop();
      Fs.readdirSync(path).forEach((file: string) => {
        filepath = Path.join(path, file);
        stat = Fs.statSync(filepath);
        if (stat.isDirectory()) {
          paths.push(filepath);
        }
        else if (stat.isFile() && Path.extname(filepath) == ".less") {
          files.push(filepath);
        }
      });
    } while (paths.length > 0);

    console.log("files ", files);

    if (files.length > 0) {
      // The first file is transcoded alone, in case of plugin should be installed
      transcodeFile(files.pop(), configuration)
        .then((filepath) => {
          resolve(filepath);
          files.forEach((file) => {
            transcodeFile(file, configuration).then(resolve).catch(reject);
          });
        });
    }
  });
}
