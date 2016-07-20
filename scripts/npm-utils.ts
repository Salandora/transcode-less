var Npm = require("npm");
var Fs = require("fs");
var Path = require("path");

class NpmUtils {

  private packagePath: string;

  constructor() {
    this.packagePath = atom.packages.getLoadedPackage("transcode-less")["path"];
  }

  /** Execute the specified command with the given arguments */
  private execute(command: string, args: string[] = undefined, resolve: (...data: any[]) => void) {
    console.debug("execute: " + command, args);
    Npm.load(this.packagePath, (error: any) => {
      if (error) {
        console.error("Error: npm.load()", error);
      }
      else {
        Npm.prefix = this.packagePath;
        var cb = (error: any, ...data: any[]) => {
          if (error) {
            console.error("Error: npm.commands." + command + "()", error);
          }
          else if (resolve) {
            resolve(data);
          }
        };
        Npm.commands[command](args, cb);
      }
    });
  }

  /** Install the specified less plugin */
  public install(packageNames: string[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.execute("install", packageNames, resolve);
    });
  }
}

export = new NpmUtils();
