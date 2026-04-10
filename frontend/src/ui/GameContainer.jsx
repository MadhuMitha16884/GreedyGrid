import { useState, useEffect, useCallback } from "react"
import GameEngine from "../engine/GameEngine"
import PluginManager from "../engine/PluginManager"
import { submitScore } from "../engine/LeaderboardService"
import Leaderboard from "./Leaderboard"
import { motion } from "framer-motion"

export default function GameContainer({ game, difficulty, setGame }) {

  const [state, setState] = useState(null)
  const [player, setPlayer] = useState("")
  const [timer, setTimer] = useState(0)
  const [hint, setHint] = useState("")

  useEffect(() => {
    let interval = null;
    if (state && state.status === "playing") {
      interval = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    } else if (state && state.status !== "playing") {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [state?.status])

  useEffect(() => {
    const newState = GameEngine.start(game, difficulty)
    setState(newState)
    setTimer(0)
    setHint("")
  }, [game, difficulty])

  const plugin = PluginManager.get(game)

  const handleKeyDown = useCallback((e) => {
    if (state && state.status === "playing" && game === "2048") {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const newState = plugin.move(state, e.key)
        setState(newState)
      }
    }
  }, [state, game, plugin])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!state) return <div style={{ color: "white" }}>Loading...</div>

  const renderGame = () => {
    if (game === "puzzle") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.size}, 80px)`, gap: "5px", background: "rgba(255,255,255,0.1)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
          {state.tiles.map((tile, index) => (
            <motion.div
              layout
              key={tile || `empty-${index}`}
              onClick={() => setState(plugin.move(state, index))}
              style={{
                width: 80, height: 80, 
                background: tile ? "linear-gradient(135deg, #f6d365, #fda085)" : "rgba(0,0,0,0.3)",
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: "24px", fontWeight: "bold", borderRadius: "8px", color: tile ? "#333" : "transparent",
                cursor: tile ? "pointer" : "default",
                boxShadow: tile ? "0 4px 6px rgba(0,0,0,0.1)" : "inset 0 4px 6px rgba(0,0,0,0.5)"
              }}
            >
              {tile}
            </motion.div>
          ))}
        </div>
      )
    }
    if (game === "2048") {
      const colors = {
        2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563", 32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72", 256: "#edcc61", 512: "#edc850", 1024: "#edc53f", 2048: "#edc22e"
      };
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.size}, 80px)`, gap: "8px", background: "#bbada0", padding: "10px", borderRadius: "8px", touchAction: "none" }}>
          {state.board.map((row, r) => row.map((cell, c) => (
            <motion.div
              layout
              key={`${r}-${c}`}
              style={{
                width: 80, height: 80,
                background: cell ? (colors[cell] || "#3c3a32") : "rgba(238, 228, 218, 0.35)",
                borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: cell > 512 ? "24px" : "32px", fontWeight: "bold",
                color: cell > 4 ? "#f9f6f2" : "#776e65",
                boxShadow: cell ? "0 2px 4px rgba(0,0,0,0.2)" : "none"
              }}
            >
              {cell}
            </motion.div>
          )))}
        </div>
      )
    }
    if (game === "sudoku") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(9, 45px)`, gap: "2px", background: "#333", padding: "4px", borderRadius: "4px" }}>
          {state.board.map((row, r) => row.map((cell, c) => {
            const isInitial = state.initial[r][c];
            return (
              <input
                key={`${r}-${c}`}
                type="number"
                min="1" max="9"
                value={cell || ""}
                readOnly={isInitial}
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if(val >= 1 && val <= 9) setState(plugin.move(state, { r, c, val }));
                    if(!e.target.value) setState(plugin.move(state, { r, c, val: null }));
                }}
                style={{
                  width: 45, height: 45, textAlign: "center", fontSize: "1.2rem",
                  border: "none",
                  borderRight: c % 3 === 2 && c !== 8 ? "2px solid #333" : "none",
                  borderBottom: r % 3 === 2 && r !== 8 ? "2px solid #333" : "none",
                  background: isInitial ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
                  color: isInitial ? "#111" : "#0056b3",
                  fontWeight: isInitial ? "bold" : "normal",
                  outline: "none"
                }}
              />
            )
          }))}
        </div>
      )
    }
  }

  function handleRestart() {
    // We clear state first to prevent stale references, although GameEngine.start returns a fresh object
    setState(null)
    setHint("")
    setTimeout(() => {
      const newState = GameEngine.start(game, difficulty)
      setState(newState)
      setTimer(0)
      setPlayer("")
    }, 0)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%", padding: "2rem" }}>
      
      {/* Header spanning fill screen */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "2rem", color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button 
            onClick={() => setGame(null)} 
            style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px", cursor: "pointer", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}
          >
            <span>← Home</span>
          </button>
          
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{game.toUpperCase()} <span style={{ color: "#aaa", fontSize: "1.2rem", fontWeight: "normal" }}>({difficulty.toUpperCase()})</span></h2>
        </div>

        <div style={{ display: "flex", gap: "30px", fontSize: "1.5rem", fontWeight: "bold", background: "rgba(0,0,0,0.3)", padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#4facfe" }}>⏱</span> {timer}s</div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.2)" }}></div>
          {game === "2048" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#f6d365" }}>⭐</span> {state.score}</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#a777e3" }}>🔄</span> {state.moves}</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexGrow: 1, gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        
        {/* Game Area */}
        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "300px" }}>
          <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center", width: "100%" }}>
            {renderGame()}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
             {plugin.getHint && (
                 <button 
                  onClick={() => {
                      const h = plugin.getHint(state);
                      setHint(h);
                      setTimeout(() => setHint(""), 5000);
                  }}
                  style={{ padding: "12px 24px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.4)", color: "#ffeb3b", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,215,0,0.2)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,215,0,0.1)"}
                 >
                  💡 Get Hint
                 </button>
             )}
             <button 
                onClick={handleRestart}
                style={{ padding: "12px 24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                ↻ Restart Game
              </button>
          </div>

          {hint && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{
                marginTop: "1rem", padding: "12px 20px", background: "rgba(0, 0, 0, 0.4)",
                color: "#ffeb3b", borderRadius: "8px", border: "1px solid rgba(255, 235, 59, 0.3)",
                maxWidth: "350px", textAlign: "center", fontSize: "1.1rem", backdropFilter: "blur(4px)"
            }}>
                💡 {hint}
            </motion.div>
          )}

          {state.status === "won" && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
              display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100
            }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ 
                background: "rgba(30,30,30,0.9)", padding: "40px", borderRadius: "16px", 
                border: "2px solid #4caf50", boxShadow: "0 0 30px rgba(76, 175, 80, 0.4)",
                textAlign: "center", color: "white", minWidth: "350px"
              }}>
                <h2 style={{ fontSize: "2.5rem", color: "#4caf50", marginTop: 0 }}>🎉 Victory! 🎉</h2>
                <div style={{ fontSize: "1.2rem", margin: "20px 0", color: "#ccc" }}>
                  <p>Time Taken: <strong>{timer}s</strong></p>
                  <p>Final Score: <strong>{plugin.getScore(state, timer)}</strong></p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "30px" }}>
                  <input
                    placeholder="Enter your name"
                    value={player}
                    onChange={(e) => setPlayer(e.target.value)}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", outline: "none", background: "rgba(0,0,0,0.5)", color: "white", fontSize: "1.1rem" }}
                  />
                  <button 
                    onClick={() => {
                       submitScore(game, difficulty, player || "Anonymous", plugin.getScore(state, timer), timer)
                       setPlayer("")
                       handleRestart()
                    }} 
                    style={{ padding: "12px 24px", background: "linear-gradient(135deg, #4caf50, #81c784)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem", boxShadow: "0 4px 10px rgba(76,175,80,0.3)" }}>
                    Submit Score & Restart
                  </button>
                  <button 
                    onClick={handleRestart}
                    style={{ padding: "12px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {state.status === "lost" && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
              display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100
            }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ 
                    background: "rgba(30,30,30,0.9)", padding: "40px", borderRadius: "16px", 
                    border: "2px solid #f44336", boxShadow: "0 0 30px rgba(244, 67, 54, 0.4)",
                    textAlign: "center", color: "white", minWidth: "350px"
                }}>
                    <h2 style={{ fontSize: "2.5rem", color: "#f44336", marginTop: 0 }}>💀 Game Over!</h2>
                    {game === "2048" ? (
                      <div style={{ fontSize: "1.2rem", margin: "20px 0", color: "#ccc" }}>
                        <p>Time Taken: <strong>{timer}s</strong></p>
                        <p>Highest Tile: <strong>{plugin.getScore(state, timer)}</strong></p>
                      </div>
                    ) : (
                      <p style={{ color: "#aaa", fontSize: "1.1rem", marginBottom: "30px" }}>No more moves available.</p>
                    )}
                    
                    {game === "2048" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px", marginBottom: "20px" }}>
                        <input
                          placeholder="Enter your name"
                          value={player}
                          onChange={(e) => setPlayer(e.target.value)}
                          style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", outline: "none", background: "rgba(0,0,0,0.5)", color: "white", fontSize: "1.1rem" }}
                        />
                        <button 
                          onClick={() => {
                             submitScore(game, difficulty, player || "Anonymous", plugin.getScore(state, timer), timer)
                             setPlayer("")
                             handleRestart()
                          }} 
                          style={{ padding: "12px 24px", background: "linear-gradient(135deg, #4caf50, #81c784)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem", boxShadow: "0 4px 10px rgba(76,175,80,0.3)" }}>
                          Submit Score & Restart
                        </button>
                      </div>
                    )}

                    <button 
                        onClick={handleRestart}
                        style={{ padding: "12px 30px", background: "linear-gradient(135deg, #f44336, #e57373)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem", width: "100%" }}
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
          )}
        </div>

        {/* Info / Leaderboard Sideline */}
        <div style={{ flex: "0 1 350px", width: "100%", minWidth: "300px" }}>
          <Leaderboard game={game} difficulty={difficulty} />
        </div>

      </div>
    </div>
  )
}