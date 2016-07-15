import Fs = require("fs");
import Less = require("less");
import Path = require("path");

export module LessConfig {

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
    public plugins: { [name: string]: any[] } = {};

    public constructor() {
    }

    public getFilepath(): string {
      return this.filepath;
    }

    /**
     * Get options object for less rendering
     */
    public getLessOptions(): Less.Options {
      var options: Less.Options = {
        plugins: []
      };

      for (var pluginName in this.plugins) {
        var pluginClass = require(pluginName);
        var plugin = new pluginClass(this.plugins[pluginName]);
        options.plugins.push(plugin);
      }

      return options;
    }
  }

  export var DefaultOptions = new LessConfig.Options();
}
