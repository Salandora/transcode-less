import Fs = require("fs");
import Less = require("less");
import Path = require("path");

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

      options.rootDir = pop<string>(rawOptions, "rootDir", Path.dirname(configPath));
      options.outDir = pop<string>(rawOptions, "outDir", Path.dirname(configPath));

      // outDir resolution
      if (!Path.isAbsolute(options.outDir)) {
        options.outDir = Path.resolve(Path.dirname(configPath), options.outDir);
      }

      // rootDir resolution
      if (!Path.isAbsolute(options.rootDir)) {
        options.rootDir = Path.resolve(Path.dirname(configPath), options.rootDir);
      }

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
      let nodeModulePaths: string[] = [];

      (<any>atom.project).getPaths().forEach((item: string) => {
        try {
          let path = Path.join(item, "node_modules");
          Fs.accessSync(path, Fs.F_OK);
          nodeModulePaths.push(path);
        }
        catch(error) {}
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
          catch (error) {}
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
