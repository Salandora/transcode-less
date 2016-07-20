import Fs = require("fs");
import Less = require("less");
import Path = require("path");
import NpmUtils = require("./npm-utils");

export module LessConfig {

  interface ILessPlugin {
    [name: string]: any[]
  }

  /**
   * TranscodeLess options
   *
   * plugins: An object keyed by plugin's name, associated to a list arguments
   *          with is passed to the plugin class' constructor
   */
  export class Options {

    public static getOptionForFile(path: string): Options {
      if (Fs.statSync(path).isFile()) {
        path = Path.dirname(path);
      }

      var configPath: string;
      do {
        configPath = Path.join(path, "lessconfig.json");
        path = Path.dirname(path);
      } while (!Fs.existsSync(configPath) && atom.project.contains(path));

      if (Fs.existsSync(configPath)) {
        var rawOptions: Options = JSON.parse(Fs.readFileSync(configPath).toString());
        var options = new Options();
        for (let prop in rawOptions) {
          options[prop] = rawOptions[prop];
        }
        options.filepath = configPath;
        return options;
      }

      return DefaultOptions;
    }

    /** Path to this option file */
    private filepath: string;

    /** Directory in which css files with be created */
    public outDir: string;

    /** Plugin list */
    public plugins: ILessPlugin = {};

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
        let options: Less.Options = {
          plugins: []
        };

        let plugins: string[] = [];
        for (let plugin in this.plugins) {
          plugins.push(plugin);
        }
        let unavailablePlugins: string[] = this.loadPlugins(options, plugins);
        if (unavailablePlugins.length > 0) {
          atom.notifications.addInfo("Less plugin install", { detail: unavailablePlugins.join(", "), dismissable: true });
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
