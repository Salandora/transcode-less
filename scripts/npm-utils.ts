var Npm = require("npm");
var Fs = require("fs");
var Path = require("path");

export class NpmUtils {

  private packagePath: string;

  constructor() {
    this.packagePath = atom.packages.getLoadedPackage("transcode-less")["path"];
  }

  /** Execute the specified command with the given arguments */
  private execute(command: string, args: string[] = undefined, callback: (...data: any[]) => void = undefined) {
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
          else {
            callback(data);
          }
        };
        Npm.commands[command](args, cb);
      }
    });
  }

  /** Install the specified less plugin */
  public install(packageName: string) {
    this.execute("install", [packageName], (...data: any[]) => {
      console.debug("Debug: Npm.commands.install()", data);
    });
  }

  /** List installed less plugin */
  public list() {
    this.execute("list", [], (data: any, list?: { dependencies?: any[] }) => {
      var pluginList: string[] = [];
      if (list && list.dependencies) {
        for (var name in list.dependencies) {
          if (name.startsWith("less-plugin-")) {
            pluginList.push(name);
          }
        }
      }
      console.log("pluginList", pluginList);
    });
  }
}
