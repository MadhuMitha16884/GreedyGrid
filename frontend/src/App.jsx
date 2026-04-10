import { useState } from "react"
import Dashboard from "./ui/Dashboard"
import GameRunner from "./games/runtime/GameRunner"

import PluginManager from "./engine/PluginManager"
import PuzzlePlugin from "./plugins/PuzzlePlugin"
import Game2048Plugin from "./plugins/Game2048Plugin"
import SudokuPlugin from "./plugins/SudokuPlugin"
import WordSearchPlugin from "./plugins/WordSearchPlugin"

PluginManager.register("puzzle", PuzzlePlugin)
PluginManager.register("2048", Game2048Plugin)
PluginManager.register("sudoku", SudokuPlugin)
PluginManager.register("wordsearch", WordSearchPlugin)

function App() {
  const [gameConfig, setGameConfig] = useState(null)

  if (gameConfig) {
    return <GameRunner config={gameConfig} setGame={setGameConfig} />
  }

  return (
    <Dashboard setGameConfig={setGameConfig} />
  )
}

export default App