var npm = require("npm");

export default {
  installLessPlugin(pluginName: string) {
    npm.commands.install(pluginName);
  }
}
