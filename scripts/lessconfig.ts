import Fs = require("fs");
import Less = require("less");
import Path = require("path");

import {UtilPath} from "./util-path";

export module LessConfig {

  interface ILessPlugin {
    [name: string]: any
  }

  function pop<TValue>(obj: Object, key: string, otherwise: TValue = undefined): TValue {
    if (obj.hasOwnProperty(key)) {
      otherwise = <TValue>obj[key];
      delete obj[key];
    }

    return otherwise;
  }

  /**
   * Returns transcode-less options of given `lessconfig.josn` path
   */
  export function getOptionForLessFile(configPath: string): Options {
    var configuration: Options;
    if (Fs.existsSync(configPath)) {
      var rawOptions: any = JSON.parse(Fs.readFileSync(configPath).toString());
      configuration = new Options();

      configuration.outDir = pop<string>(rawOptions, "outDir", Path.dirname(configPath));
      configuration.rootDir = pop<string>(rawOptions, "rootDir");

      // outDir resolution
      if (!Path.isAbsolute(configuration.outDir)) {
        configuration.outDir = Path.resolve(Path.dirname(configPath), configuration.outDir);
      }

      // rootDir resolution
      if (!configuration.rootDir) {
        let rootDir = Path.dirname(configPath);
        let depth = UtilPath.getMinDepthOfLessFiles(rootDir);
        let paths = [Path.dirname(configPath)];
        let depths = [depth];

        while (paths.length == 1 && depths[0] > 0) {
          rootDir = paths.pop();
          depth = depths.pop();
          Fs.readdirSync(rootDir).forEach(path => {
            if (path[0] != "." && path != "node_modules" && Fs.statSync(Path.join(rootDir, path)).isDirectory()) {
              path = Path.join(rootDir, path);
              depth = UtilPath.getMinDepthOfLessFiles(path);
              if (depth >= 0) {
                paths.push(path);
                depths.push(depth);
              }
            }
          });
        }

        configuration.rootDir = paths.pop();
      }
      else if (!Path.isAbsolute(configuration.rootDir)) {
        configuration.rootDir = Path.resolve(Path.dirname(configPath), configuration.rootDir);
      }

      if (rawOptions.paths) {
        for (let p = rawOptions.paths.length - 1; p >= 0; p--) {
          if (!Path.isAbsolute(rawOptions.paths[p])) {
            rawOptions.paths[p] = Path.resolve(configuration.rootDir, rawOptions.paths[p]);
          }
        }
      }

      if (rawOptions.plugins) {
        configuration.plugins = pop(rawOptions, "plugins", []);
      }
      rawOptions.plugins = [];

      configuration.options = rawOptions;
      configuration.filepath = configPath;
    }
    else {
      configuration = DefaultOptions;
    }

    return configuration;
  }

  /**
   * TranscodeLess options
   */
  export class Options {

    /** Path to this option file */
    public filepath: string;

    /** Root directory */
    public rootDir: string;

    /** Directory in which css files with be created */
    public outDir: string;

    /** Plugin list */
    public plugins: ILessPlugin = {};

    /** Less options */
    public options: Less.Options = {
      plugins: []
    };

    public constructor() {
    }

    public getFilepath(): string {
      return this.filepath;
    }

    /**
     * Add to `options` loaded plugins and return unloaded
     */
    private loadPlugins(options: Less.Options, plugins: string[]): string[] {
      let unavailablePlugins: string[] = [];
      let nodeModulePaths: string[] = [];

      (<any>atom.project).getPaths().forEach((item: string) => {
        let path = Path.join(item, "node_modules");
        if (UtilPath.existsSync(path)) {
          nodeModulePaths.push(path);
        }
      });

      for (let index in plugins) {
        let name = plugins[index];
        let loaded = false;
        for (let p = 0; p < nodeModulePaths.length; p++) {
          try {
            let pluginClass = require(Path.join(nodeModulePaths[p], name));
            let plugin = new pluginClass(this.plugins[name]);
            options.plugins.push(plugin);
            loaded = true;
          }
          catch (error) {
            console.error(error);
          }
        }
        if (!loaded) {
          unavailablePlugins.push(name);
        }
      }

      return unavailablePlugins;
    }

    /**
     * Get options object for less rendering
     */
    public loadOptions(): Promise<Less.Options> {
      return new Promise<Less.Options>((resolve: (value?: Less.Options) => void, reject: (reason?: any) => void) => {
        let options: Less.Options = this.options;

        let plugins: string[] = [];
        for (let plugin in this.plugins) {
          plugins.push(plugin);
        }
        let unavailablePlugins: string[] = this.loadPlugins(options, plugins);

        if (unavailablePlugins.length == 1) {
          atom.notifications.addWarning(unavailablePlugins[0] + " is not installed", { dismissable: true });
        }
        else if (unavailablePlugins.length > 1) {
          atom.notifications.addWarning(unavailablePlugins.join(", ") + " are not installed", { dismissable: true });
        }

        resolve(options);
      });
    }
  }

  export var DefaultOptions = new LessConfig.Options();
}
