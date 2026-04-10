import { useEffect, useState } from "react"
import { getScores } from "../engine/LeaderboardService"
import { motion, AnimatePresence } from "framer-motion"

export default function Leaderboard({ game, difficulty, title="Leaderboard" }) {
  const [scores, setScores] = useState([])

  useEffect(() => {
    const fetchScores = async () => {
      let filteredScores = await getScores(game, difficulty)
      if (game === "sudoku") {
        // For Sudoku, score is time taken. Lower is better.
        filteredScores.sort((a,b) => a.score - b.score)
      } else {
        // For Puzzle (1000 - moves) and 2048 (highest tile). Higher is better.
        filteredScores.sort((a,b) => b.score - a.score || a.time - b.time)
      }
      setScores(filteredScores.slice(0, 10))
    }
    
    fetchScores()
    const interval = setInterval(fetchScores, 2000)
    return () => clearInterval(interval)
  }, [game, difficulty])

  return (
    <div className="leaderboard" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "20px", color: "white" }}>
      <h3 style={{ marginTop: 0, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "10px" }}>{title}</h3>
      {scores.length === 0 ? (
        <p style={{ color: "#aaa" }}>No scores yet. Be the first!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <AnimatePresence>
            {scores.map((s, i) => (
              <motion.li 
                key={`${s.player}-${s.date}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px", margin: "5px 0",
                  background: i === 0 ? "linear-gradient(90deg, #FFD70033, transparent)" : 
                              i === 1 ? "linear-gradient(90deg, #C0C0C033, transparent)" : 
                              i === 2 ? "linear-gradient(90deg, #CD7F3233, transparent)" : "transparent",
                  borderLeft: i === 0 ? "4px solid #FFD700" : 
                              i === 1 ? "4px solid #C0C0C0" : 
                              i === 2 ? "4px solid #CD7F32" : "4px solid transparent",
                  borderRadius: "4px"
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", width: "20px" }}>#{i+1}</span>
                  <span>{s.player}</span>
                  {!game && (
                    <span style={{ fontSize: "0.75em", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", color: "#aaa" }}>
                      {s.game} ({s.difficulty})
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", minWidth: "60px", textAlign: "right" }}>
                    {s.game === "2048" || s.game === undefined ? `⭐ ${s.score}` : `🔄 ${s.score}`}
                  </span>
                  <span style={{ color: "#ccc", fontSize: "0.9em", minWidth: "50px", textAlign: "right" }}>⏱ {s.time}s</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}