class PluginManager {

  constructor() {
    this.plugins = {}
  }

  register(name, plugin) {
    this.plugins[name] = plugin
  }

  get(name) {
    return this.plugins[name]
  }

}

const manager = new PluginManager()

export default manager