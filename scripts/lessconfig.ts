import Fs = require("fs");
import Less = require("less");
import Path = require("path");
import NpmUtils = require("./npm-utils");

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

  export function getOptionForLessFile(path: string): Options {
    if (Fs.statSync(path).isFile()) {
      path = Path.dirname(path);
    }

    var configPath: string;
    do {
      configPath = Path.join(path, "lessconfig.json");
      path = Path.dirname(path);
    } while (!Fs.existsSync(configPath) && atom.project.contains(path));

    var options: Options;
    if (Fs.existsSync(configPath)) {
      var rawOptions: any = JSON.parse(Fs.readFileSync(configPath).toString());
      options = new Options();

      options.rootDir = pop<string>(rawOptions, "rootDir");
      options.outDir = pop<string>(rawOptions, "outDir");
      if (rawOptions.plugins) {
        options.plugins = rawOptions.plugins;
      }
      rawOptions.plugins = [];
      options.options = rawOptions;

      options.filepath = configPath;
    }
    else {
      options = DefaultOptions;
    }

    if ((<any>options.options).paths) {
      let basepath = Path.dirname(path);
      for (let i = 0; i < (<any>options.options).paths.length; i++) {
        if (!Path.isAbsolute((<any>options.options).paths[i])) {
          (<any>options.options).paths[i] = Path.resolve(basepath, (<any>options.options).paths[i]);
        }
      }
    }

    return options;
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

    /** Add to `options` loaded plugins and return unloaded */
    private loadPlugins(options: Less.Options, plugins: string[]): string[] {
      let unavailablePlugins: string[] = [];
      for (let index in plugins) {
        let name = plugins[index];
        try {
          let pluginClass = require(name);
          let plugin = new pluginClass(this.plugins[name]);
          options.plugins.push(plugin);
        }
        catch (error) {
          console.error(error);
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

        let basepath = Path.dirname(this.filepath);
        if (this.outDir) {
          if (!Path.isAbsolute(this.outDir)) {
            this.outDir = Path.resolve(basepath, this.outDir);
          }
        }

        let plugins: string[] = [];
        for (let plugin in this.plugins) {
          plugins.push(plugin);
        }
        let unavailablePlugins: string[] = this.loadPlugins(options, plugins);
        if (unavailablePlugins.length > 0) {
          atom.notifications.addInfo("Less plugin install", { detail: unavailablePlugins.join(", ") });
          NpmUtils.install(unavailablePlugins)
            .then(() => {
              this.loadPlugins(options, unavailablePlugins);
              resolve(options);
            })
            .catch(() => {
              unavailablePlugins = this.loadPlugins(options, unavailablePlugins);
              atom.notifications.addWarning(unavailablePlugins.join(", ") + " are not available", { dismissable: true });
              resolve(options);
            });
        }
        else {
          resolve(options);
        }
      });
    }
  }

  export var DefaultOptions = new LessConfig.Options();
}
