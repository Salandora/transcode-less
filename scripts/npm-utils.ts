var Npm = require("npm");
var Fs = require("fs");
var Path = require("path");

export class NpmUtils {

  private packagePath: string;

  constructor() {
    var paths: string[] = atom.project.getPaths();
    for (let i = 0; i < paths.length; i++) {
      var filepath = Path.join(paths[i], "package.json");
      if (Fs.existsSync(filepath)) {
        this.packagePath = filepath;
      }
    }
  }

  public install(packageName: string) {
    Npm.load(require(this.packagePath), (error: any) => {
      if (error) {
        console.error("Error: NpmUtils.install()", error);
      }
      else {
        Npm.commands.install([packageName], (error: any, data: any) => {
          if (error) {
            console.error("Error: Npm.commands.install()", error);
          }
          else {
            console.debug("Debug: Npm.commands.install()", data);
          }
        });
      }
    });
  }

  public search(packageName: string) {
    console.debug("NpmUtils.search(): loading");
    Npm.load(require(this.packagePath), (error: any) => {
      if (error) {
        console.error("Error: NpmUtils.search()", error);
      }
      else {
        console.debug("NpmUtils.search(): loaded");
        console.debug("NpmUtils.search(): searching");
        Npm.commands.search(["less-plugin", packageName], (error: any, data: any) => {
          if (error) {
            console.error("Error: Npm.commands.search()", error);
          }
          else {
            console.debug("Debug: Npm.commands.search()", data);
          }
        });
      }
    });
  }
}
