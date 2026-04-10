import { useState, useEffect, useCallback } from "react";
import GameAdapter from "../adapters/GameAdapter";
import { getNewGameConfig } from "../../plugins/aiGenerator";
import { useMovement } from "./movement";
import { trackSession } from "../../engine/analytics";
import { getAdaptiveDifficulty } from "../../engine/adaptive";
import { getHint } from "../../engine/hintSystem";
import { motion } from "framer-motion";
import Leaderboard from "../../ui/Leaderboard";
import { submitScore } from "../../engine/LeaderboardService";

export default function GameRunner({ config, setGame }) {
  const [adapter, setAdapter] = useState(null);
  const [state, setState] = useState(null);
  const [timer, setTimer] = useState(0);
  const [player, setPlayer] = useState("");
  const [currentHint, setCurrentHint] = useState("");
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [activeConfig, setActiveConfig] = useState(config);
  const [aiTip, setAiTip] = useState("");

  const initializeGame = useCallback(() => {
    const dynamicDiff = getAdaptiveDifficulty(config.game, config.difficulty);
    const aiConfig = getNewGameConfig({ ...config, difficulty: dynamicDiff });
    setActiveConfig(aiConfig);
    if(aiConfig.aiTip) setAiTip(aiConfig.aiTip);

    const gameAdapter = new GameAdapter(aiConfig.game, aiConfig.difficulty);
    setAdapter(gameAdapter);
    
    const initialState = gameAdapter.init(aiConfig);
    setState(initialState);
    setTimer(0);
    setCurrentHint("");
    setHintsRemaining(config.hints ? 3 : 0);
  }, [config]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval = null;
    if (state && state.status === "playing") {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (state && state.status !== "playing") {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [state?.status]);

  useMovement(activeConfig.movement, activeConfig.game, setState);

  const handleKeyDown = useCallback((e) => {
    if (state && state.status === "playing" && activeConfig.game === "2048") {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const newState = adapter.play(state, e.key);
        setState(newState);
      }
    }
  }, [state, activeConfig.game, adapter]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Touch Handlers for Mobile 2048 */
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || state.status !== "playing" || activeConfig.game !== "2048") return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) setState(adapter.play(state, "ArrowLeft"));
      else setState(adapter.play(state, "ArrowRight"));
    } else if (!isHorizontal && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY > 0) setState(adapter.play(state, "ArrowUp"));
      else setState(adapter.play(state, "ArrowDown"));
    }
  };

  const handleUseHint = () => {
    if(hintsRemaining > 0) {
      setCurrentHint(getHint(state, activeConfig.game));
      setHintsRemaining(h => h - 1);
    }
  };

  const handleGameEnd = useCallback(() => {
    trackSession({
      game: activeConfig.game,
      difficulty: activeConfig.difficulty,
      score: adapter.getScore(state, timer),
      time: timer,
      mistakes: state.mistakes || 0,
      skills: activeConfig.skills || []
    });
    setPlayer("");
    initializeGame(); 
  }, [activeConfig, adapter, state, timer, initializeGame]);

  if (!state || !adapter) return <div style={{ color: "white" }}>Loading AI Assets...</div>;

  const renderGame = () => {
    if (activeConfig.game === "wordsearch") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.size}, clamp(25px, 8vw, 45px))`, gap: "2px", background: "#333", padding: "4px", borderRadius: "8px" }}>
            {state.board.map((row, r) => row.map((cell, c) => {
              const isSelected = state.selectedCells.some(s => s.r === r && s.c === c);
              const isFound = state.foundCells.some(s => s.r === r && s.c === c);
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => setState(adapter.play(state, { r, c }))}
                  style={{
                    width: "100%", aspectRatio: "1/1", display: "flex", justifyContent: "center", alignItems: "center",
                    background: isSelected ? "#4caf50" : isFound ? "#f6d365" : "rgba(255,255,255,0.8)",
                    color: (isSelected || isFound) ? "#fff" : "#111",
                    fontWeight: "bold", fontSize: "clamp(1rem, 4vw, 1.4rem)", borderRadius: "4px", cursor: "pointer",
                    userSelect: "none", touchAction: "manipulation"
                  }}
                >
                  {cell}
                </div>
              );
            }))}
          </div>
          <div style={{ background: "rgba(0,0,0,0.4)", padding: "15px", borderRadius: "8px", width: "100%", maxWidth: "300px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#4facfe" }}>Questions to Answer</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.95rem" }}>
               {state.words.map(w => (
                 <li key={w.a} style={{ marginBottom: "8px", color: w.found ? "#aaa" : "white", textDecoration: w.found ? "line-through" : "none" }}>
                    • {w.q}
                 </li>
               ))}
            </ul>
          </div>
        </div>
      );
    }
    if (activeConfig.game === "puzzle") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.size}, 80px)`, gap: "5px", background: "rgba(255,255,255,0.1)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
          {state.tiles.map((tile, index) => (
            <motion.div
              layout
              key={tile || `empty-${index}`}
              onClick={() => setState(adapter.play(state, index))}
              style={{
                width: 80, height: 80, 
                background: tile ? "linear-gradient(135deg, #f6d365, #fda085)" : "rgba(0,0,0,0.3)",
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: "24px", fontWeight: "bold", borderRadius: "8px", color: tile ? "#333" : "transparent",
                cursor: tile ? "pointer" : "default",
                boxShadow: tile ? "0 4px 6px rgba(0,0,0,0.1)" : "inset 0 4px 6px rgba(0,0,0,0.5)",
                userSelect: "none", touchAction: "manipulation"
              }}
            >
              {tile}
            </motion.div>
          ))}
        </div>
      );
    }
    if (activeConfig.game === "2048") {
      const colors = { 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563", 32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72", 256: "#edcc61", 512: "#edc850", 1024: "#edc53f", 2048: "#edc22e" };
      return (
        <div 
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{ display: "grid", gridTemplateColumns: `repeat(${state.size}, 80px)`, gap: "8px", background: "#bbada0", padding: "10px", borderRadius: "8px", touchAction: "none" }}
        >
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
                boxShadow: cell ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                userSelect: "none"
              }}
            >
              {cell}
            </motion.div>
          )))}
        </div>
      );
    }
    if (activeConfig.game === "sudoku") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(9, clamp(30px, 5vw, 45px))`, gap: "2px", background: "#333", padding: "4px", borderRadius: "4px", margin: "0 auto" }}>
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
                    if(val >= 1 && val <= 9) setState(adapter.play(state, { r, c, val }));
                    if(!e.target.value) setState(adapter.play(state, { r, c, val: null }));
                }}
                style={{
                  width: "100%", aspectRatio: "1/1", textAlign: "center", fontSize: "clamp(1rem, 4vw, 1.2rem)",
                  border: "none", borderRight: c % 3 === 2 && c !== 8 ? "2px solid #333" : "none",
                  borderBottom: r % 3 === 2 && r !== 8 ? "2px solid #333" : "none",
                  background: isInitial ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
                  color: isInitial ? "#111" : "#0056b3",
                  fontWeight: isInitial ? "bold" : "normal", outline: "none",
                  padding: 0
                }}
              />
            );
          }))}
        </div>
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%", padding: "1rem" }}>
      
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "1.5rem", color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", gap: "10px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={() => setGame(null)} 
            style={{ padding: "8px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px", cursor: "pointer", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}
          >
            <span>← Back</span>
          </button>
          
          <h2 style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}>
             {activeConfig.name || activeConfig.game.toUpperCase()} 
             <span style={{ color: "#aaa", fontSize: "0.9rem", fontWeight: "normal", marginLeft: "5px" }}>
                ({activeConfig.difficulty})
             </span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "15px", fontSize: "clamp(1rem, 3vw, 1.5rem)", fontWeight: "bold", background: "rgba(0,0,0,0.3)", padding: "10px 15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ color: "#4facfe" }}>⏱</span> {timer}s</div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.2)" }}></div>
          {activeConfig.game === "2048" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ color: "#f6d365" }}>⭐</span> {state.score}</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ color: "#a777e3" }}>🔄</span> {state.moves}</div>
          )}
        </div>
      </div>

      {aiTip && (
        <div style={{ background: "linear-gradient(90deg, rgba(76, 175, 80, 0.2), transparent)", borderLeft: "4px solid #4caf50", padding: "10px", color: "white", marginBottom: "15px", borderRadius: "4px", fontSize: "0.9rem" }}>
          🤖 <strong>AI Mod:</strong> {aiTip}
        </div>
      )}

      {currentHint && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(255, 193, 7, 0.2)", border: "1px solid #ffeb3b", color: "#ffeb3b", padding: "10px", marginBottom: "15px", borderRadius: "8px", textAlign: "center", fontSize: "0.9rem" }}>
          💡 Hint: {currentHint}
        </motion.div>
      )}

      <div style={{ display: "flex", flexGrow: 1, gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        
        {/* Game Area */}
        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "600px" }}>
          
          {activeConfig.hints && (
             <div style={{ marginBottom: "15px" }}>
                <button onClick={handleUseHint} disabled={hintsRemaining === 0} style={{ padding: "8px 16px", background: "#ff9800", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontWeight: "bold", opacity: hintsRemaining === 0 ? 0.5 : 1 }}>
                   Get Hint ({hintsRemaining} left)
                </button>
             </div>
          )}

          <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center", width: "100%" }}>
            {renderGame()}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
             <button 
                onClick={initializeGame}
                style={{ padding: "12px 24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
              >
                ↻ Restart Game
              </button>
          </div>

          {state.status === "won" && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: "20px" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: "rgba(30,30,30,0.9)", padding: "30px", borderRadius: "16px", border: "2px solid #4caf50", boxShadow: "0 0 30px rgba(76, 175, 80, 0.4)", textAlign: "center", color: "white", width: "100%", maxWidth: "400px" }}>
                <h2 style={{ fontSize: "2rem", color: "#4caf50", marginTop: 0 }}>🎉 Victory! 🎉</h2>
                <div style={{ fontSize: "1.1rem", margin: "20px 0", color: "#ccc" }}>
                  <p>Time Taken: <strong>{timer}s</strong></p>
                  <p>Final Score: <strong>{adapter.getScore(state, timer)}</strong></p>
                </div>
                <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    placeholder="Enter your name"
                    value={player}
                    onChange={(e) => setPlayer(e.target.value)}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", outline: "none", background: "rgba(0,0,0,0.5)", color: "white", fontSize: "1.1rem" }}
                  />
                  <button onClick={() => {
                    submitScore(activeConfig.game, activeConfig.difficulty, player || "Anonymous", adapter.getScore(state, timer), timer);
                    handleGameEnd();
                  }} style={{ padding: "12px 24px", background: "linear-gradient(135deg, #4caf50, #81c784)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                    Submit Score & Play Again
                  </button>
                  <button onClick={handleGameEnd} style={{ padding: "12px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", width: "100%" }}>
                    Just Play Again
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {state.status === "lost" && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: "20px" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: "rgba(30,30,30,0.9)", padding: "30px", borderRadius: "16px", border: "2px solid #f44336", boxShadow: "0 0 30px rgba(244, 67, 54, 0.4)", textAlign: "center", color: "white", width: "100%", maxWidth: "400px" }}>
                    <h2 style={{ fontSize: "2rem", color: "#f44336", marginTop: 0 }}>💀 Game Over!</h2>
                    {activeConfig.game === "2048" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px", marginBottom: "15px" }}>
                        <input
                          placeholder="Enter your name"
                          value={player}
                          onChange={(e) => setPlayer(e.target.value)}
                          style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", outline: "none", background: "rgba(0,0,0,0.5)", color: "white", fontSize: "1.1rem" }}
                        />
                        <button 
                          onClick={() => {
                            submitScore(activeConfig.game, activeConfig.difficulty, player || "Anonymous", adapter.getScore(state, timer), timer);
                            handleGameEnd();
                          }} 
                          style={{ padding: "12px 24px", background: "linear-gradient(135deg, #4caf50, #81c784)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1.1rem", width: "100%" }}>
                          Submit Score & Try Again
                        </button>
                      </div>
                    )}
                    <button onClick={handleGameEnd} style={{ padding: "12px 30px", background: "linear-gradient(135deg, #f44336, #e57373)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                        Record Stats & Try Again
                    </button>
                </motion.div>
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 300px", width: "100%", maxWidth: "600px" }}>
          <Leaderboard game={activeConfig.game} difficulty={activeConfig.difficulty} />
        </div>

      </div>
    </div>
  );
}
