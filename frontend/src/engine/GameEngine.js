import PluginManager from "./PluginManager"
import gamesConfig from "../configs"

class GameEngine {

  start(gameType, difficulty) {

    const plugin = PluginManager.get(gameType)

    if (!plugin) {
      console.error("Plugin not found:", gameType)
      return null
    }

    const config = gamesConfig[gameType]?.difficulties[difficulty] || {}

    return plugin.init(config)

  }

}

export default new GameEngine()