import PluginManager from "../../engine/PluginManager";

/**
 * Wraps existing game plugins into a standardized interface for GameRunner.
 */
export default class GameAdapter {
  constructor(gameKey, difficulty) {
    this.gameKey = gameKey;
    this.plugin = PluginManager.get(gameKey);
    this.difficulty = difficulty;
    
    if(!this.plugin) {
      throw new Error(`Plugin for ${gameKey} not found.`);
    }
  }

  init(aiConfigVariations = null) {
    // Some plugins might just need difficulty, but we can intercept and mutate state 
    // if aiConfigVariations was provided.
    let state = this.plugin.init(this.difficulty);

    if (aiConfigVariations && this.gameKey === "sudoKu") {
       // Optional: apply ai structural changes to state here
    }

    return state;
  }

  play(state, moveInfo) {
    return this.plugin.move(state, moveInfo);
  }

  getScore(state, time) {
    return this.plugin.getScore(state, time);
  }

  isWon(state) {
    return state.status === "won";
  }

  isLost(state) {
    return state.status === "lost";
  }
}
