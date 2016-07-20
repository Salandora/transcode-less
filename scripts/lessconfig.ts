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
        var rawOptions: Options = require(configPath);
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
    private loadPlugins(plugins: ILessPlugin, options: Less.Options, resolve: (value?: Less.Options) => void) {
      let uninstalledPlugins: ILessPlugin = {};
      let uninstalledPluginNames: string[] = [];

      for (let pluginName in plugins) {
        try {
          var pluginClass = require(pluginName);
          var plugin = new pluginClass(plugins[pluginName]);
          options.plugins.push(plugin);
        }
        catch (error) {
          uninstalledPlugins[pluginName] = plugins[pluginName];
          uninstalledPluginNames.push(pluginName);
        }
      }

      if (uninstalledPluginNames.length > 0) {
        NpmUtils.install(uninstalledPluginNames)
          .then(() => this.loadPlugins(uninstalledPlugins, options, resolve));
      }
      else {
        resolve(options);
      }
    }

    /**
     * Get options object for less rendering
     */
    public loadOptions(): Promise<Less.Options> {
      return new Promise<Less.Options>((resolve: (value?: Less.Options) => void, reject: (reason?: any) => void) => {
        let options: Less.Options = {
          plugins: []
        };

        this.loadPlugins(this.plugins, options, resolve);
      });
    }
  }

  export var DefaultOptions = new LessConfig.Options();
}
