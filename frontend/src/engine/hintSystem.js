import PluginManager from "./PluginManager";

export function getHint(gameState, gameKey) {
  if (!gameState) return "No game active.";

  const plugin = PluginManager.get(gameKey);
  if (plugin && typeof plugin.getHint === "function") {
      return plugin.getHint(gameState);
  }

  // Fallbacks if plugin doesn't have getHint
  if (gameKey === "2048") {
    return "Try keeping your highest tile in a corner!";
  }

  if (gameKey === "puzzle") {
    // Basic hint for puzzle: just find any valid move
    const emptyIdx = gameState.tiles.indexOf(null);
    if (emptyIdx === -1) return "No empty space found!";
    
    // Simplistic text since we just want a "basic hint"
    return "Click a tile adjacent to the empty spot.";
  }

  if (gameKey === "sudoku") {
    return "Look for a row or column that is almost full.";
  }

  if (gameKey === "wordsearch") {
    const unfound = gameState.words.find(w => !w.found);
    if (!unfound) return "You found them all!";
    return `Look for the letter "${unfound.a[0]}" near the center or edges to find "${unfound.a}".`;
  }

  return "Stay focused and plan your next move.";
}
