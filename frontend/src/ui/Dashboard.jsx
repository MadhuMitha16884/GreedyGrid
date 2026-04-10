import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import gamesConfig from "../configs"
import Leaderboard from "./Leaderboard"
import GameBuilder from "../games/builder/GameBuilder"
import { getSkillProgress } from "../engine/analytics"

export default function Dashboard({ setGameConfig }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [customGames, setCustomGames] = useState([]);
  const [skillProgress, setSkillProgress] = useState({});

  useEffect(() => {
    // Load custom games
    const loaded = JSON.parse(localStorage.getItem("greedy_grid_custom_games") || "[]");
    setCustomGames(loaded);

    // Load analytics
    setSkillProgress(getSkillProgress());
  }, [showBuilder]);

  const [selectedDifficulties, setSelectedDifficulties] = useState(
    Object.keys(gamesConfig).reduce((acc, key) => {
      acc[key] = Object.keys(gamesConfig[key].difficulties)[0];
      return acc;
    }, {})
  );

  const handleDifficultyChange = (gameKey, diff) => {
    setSelectedDifficulties(prev => ({ ...prev, [gameKey]: diff }));
  };

  const handleStartLegacy = (gameKey) => {
    // Transform legacy game to a configuration to run in AI mode Universally
    const aiConfig = {
      id: `legacy-${gameKey}-${Date.now()}`,
      name: gamesConfig[gameKey].name,
      game: gameKey,
      difficulty: selectedDifficulties[gameKey],
      hints: true, // Auto-enable hints
      movement: false, 
      skills: []
    };
    setGameConfig(aiConfig);
  };

  const handleStartCustom = (config) => {
    setGameConfig(config);
  };

  const handleDeleteCustom = (id) => {
    const updated = customGames.filter(g => g.id !== id);
    setCustomGames(updated);
    localStorage.setItem("greedy_grid_custom_games", JSON.stringify(updated));
  };

  if (showBuilder) {
    return <GameBuilder onClose={() => setShowBuilder(false)} />;
  }

  return (
    <div className="center" style={{ padding: "2rem" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1000px" }}>
        <div>
          <motion.h1 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            style={{ marginBottom: "0.5rem", fontSize: "3rem" }}
          >
            GreedyGrid
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: "2rem", color: "#aaa" }}
          >
            Select a game to play or create your own
          </motion.p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBuilder(true)}
          style={{ padding: "12px 24px", background: "linear-gradient(135deg, #a777e3, #6e8efb)", border: "none", borderRadius: "8px", color: "white", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
        >
          + Create Game
        </motion.button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", width: "100%", maxWidth: "1000px" }}>
        
        {/* Render Defaults */}
        {Object.entries(gamesConfig).map(([key, config], index) => {
          const accents = {
            puzzle: "linear-gradient(135deg, #f6d365, #fda085)",
            "2048": "linear-gradient(135deg, #f2b179, #f65e3b)",
            sudoku: "linear-gradient(135deg, #4facfe, #00f2fe)",
            memory: "linear-gradient(135deg, #6e8efb, #a777e3)",
            wordsearch: "linear-gradient(135deg, #ff758c, #ff7eb3)"
          }

          return (
            <motion.div
              key={`default-${key}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              style={{
                borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)", display: "flex", flexDirection: "column",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)", textAlign: "center", overflow: "hidden"
              }}
            >
              <div style={{ background: accents[key], padding: "1.5rem 1rem", color: "#fff" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{config.icon}</div>
                <h2 style={{ margin: 0, fontSize: "1.8rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {config.name}
                </h2>
              </div>

              <p style={{ padding: "0 1.5rem", marginTop: "1.5rem", fontSize: "0.95rem", color: "#ccc", textAlign: "left" }}>
                {config.description}
              </p>
              
              <div style={{ padding: "0 1.5rem 1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <label style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "#aaa", textAlign: "left" }}>
                  Difficulty:
                </label>
                <select 
                  value={selectedDifficulties[key]} 
                  onChange={(e) => handleDifficultyChange(key, e.target.value)}
                  style={{ padding: "0.8rem", borderRadius: "8px", marginBottom: "1.5rem", background: "rgba(0,0,0,0.4)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontSize: "1rem", outline: "none" }}
                >
                  {Object.keys(config.difficulties).map(diff => (
                    <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                  ))}
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStartLegacy(key)}
                  style={{
                    marginTop: "auto", padding: "1rem", borderRadius: "8px", border: "none",
                    background: accents[key], color: "white", fontWeight: "bold",
                    fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                  }}
                >
                  Play {config.name}
                </motion.button>
              </div>
            </motion.div>
          )
        })}

        {/* Render Custom Games built via GameBuilder */}
        {customGames.map((customConfig, index) => {
          return (
            <motion.div
              key={`custom-${customConfig.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              style={{
                borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(76, 175, 80, 0.5)",
                backdropFilter: "blur(10px)", display: "flex", flexDirection: "column",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)", textAlign: "center", overflow: "hidden"
              }}
            >
              <div style={{ background: "linear-gradient(135deg, #4caf50, #81c784)", padding: "1.5rem 1rem", color: "#fff", position: "relative" }}>
                <span style={{ position: "absolute", top: 10, right: 10, fontSize: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "10px" }}>Custom</span>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {customConfig.name}
                </h2>
              </div>

              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1, textAlign: "left", fontSize: "0.9rem", color: "#ccc", gap: "5px" }}>
                <div><strong>Base Game:</strong> {customConfig.game}</div>
                <div><strong>Difficulty:</strong> {customConfig.difficulty}</div>
                <div><strong>Hints:</strong> {customConfig.hints ? "Yes" : "No"}</div>
                <div><strong>Movement:</strong> {customConfig.movement ? "Yes" : "No"}</div>
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {customConfig.skills && customConfig.skills.map(s => (
                    <span key={s} style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem" }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteCustom(customConfig.id)}
                    style={{
                      padding: "1rem", borderRadius: "8px", border: "none",
                      background: "rgba(244, 67, 54, 0.8)", color: "white", fontWeight: "bold",
                      fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}
                    title="Delete Custom Game"
                  >
                    🗑️
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartCustom(customConfig)}
                    style={{
                      flexGrow: 1, padding: "1rem", borderRadius: "8px", border: "none",
                      background: "rgba(76, 175, 80, 0.8)", color: "white", fontWeight: "bold",
                      fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}
                  >
                    Play {customConfig.name}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: "4rem", width: "100%", maxWidth: "1000px", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 400px" }}>
          <Leaderboard title="Global Leaderboard" />
        </div>
        <div style={{ flex: "1 1 400px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ margin: "0 0 1rem 0", color: "#4caf50" }}>Learning Outcomes (Skills)</h2>
          {Object.keys(skillProgress).length === 0 ? (
            <p style={{ color: "#aaa" }}>Play custom games to track skills.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {Object.entries(skillProgress).map(([skill, stats]) => (
                <div key={skill} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                   <div>
                     <strong style={{ fontSize: "1.1rem", display: "block" }}>{skill}</strong>
                     <span style={{ fontSize: "0.85rem", color: "#ccc" }}>Played: {stats.gamesPlayed} | Mistakes: {stats.mistakes}</span>
                   </div>
                   <div style={{ textAlign: "right" }}>
                     <span style={{ color: "#f6d365", fontWeight: "bold" }}>Score: {stats.totalScore}</span><br/>
                     <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Time: {stats.totalTime}s</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}