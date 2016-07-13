import less = require("less");

export module LessConfig {

  export class Options {
    public plugins: { [name: string]: any[] } = {};

    public getLessOptions() {
      var options: Less.Options = {
        plugins: []
      };

      for (var pluginName in this.plugins) {
        var pluginClass = require(pluginName);

        var Fake = function() {

        }
        var plugin = this.getPluginInstance(pluginName, this.plugins[pluginName]);
      }
    }

    private getPluginInstance(name: string, args: any[]): Less.Plugin {
      var pluginClass = require(name);

      // Fake class for plugin instanciation
      class FakeClass implements Less.Plugin {
        public install: (less: LessStatic, pluginManager: Less.PluginManager) => void ;

        constructor(realConstructor: any, args: any[]) {
          realConstructor.apply(this, args);
        }
      }
      FakeClass.prototype = pluginClass.prototype;

      return new FakeClass(pluginClass.prototype.constructor, args);
    }
  }

  export var DefaultOptions = new LessConfig.Options();
}
