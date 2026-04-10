import { useState } from "react";
import { motion } from "framer-motion";

export default function GameBuilder({ onClose }) {
  const [game, setGame] = useState("sudoku");
  const [name, setName] = useState("My Custom Game");
  const [difficulty, setDifficulty] = useState("easy");
  const [hints, setHints] = useState(false);
  const [movement, setMovement] = useState(false);
  
  const [selectedSkills, setSelectedSkills] = useState({
    "problem-solving": false,
    "focus": false,
    "vocabulary": false,
    "algorithms": false
  });

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
  };

  const handleSave = () => {
    const config = {
      id: Date.now().toString(),
      name,
      game,
      difficulty,
      hints,
      movement,
      skills: Object.keys(selectedSkills).filter(k => selectedSkills[k])
    };

    const existing = JSON.parse(localStorage.getItem("greedy_grid_custom_games") || "[]");
    existing.push(config);
    localStorage.setItem("greedy_grid_custom_games", JSON.stringify(existing));
    
    alert("Game saved successfully!");
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "2rem", width: "100%", maxWidth: "600px", margin: "0 auto", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ margin: 0, fontSize: "2rem", color: "#4facfe" }}>Game Builder</h2>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Game Name</label>
          <input 
            type="text" value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "1rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Base Game Type</label>
          <select 
            value={game} onChange={e => setGame(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "1rem" }}
          >
            <option value="sudoku">Sudoku</option>
            <option value="puzzle">Sliding Puzzle</option>
            <option value="2048">2048</option>
            <option value="wordsearch">Word Search</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Difficulty</label>
          <select 
            value={difficulty} onChange={e => setDifficulty(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: "1rem" }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "2rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
             <input type="checkbox" checked={hints} onChange={e => setHints(e.target.checked)} style={{ width: "18px", height: "18px" }} />
             Hints Enabled
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
             <input type="checkbox" checked={movement} onChange={e => setMovement(e.target.checked)} style={{ width: "18px", height: "18px" }} />
             Movement Challenges
          </label>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Skill Tags</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
             {Object.keys(selectedSkills).map(skill => (
               <button 
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", cursor: "pointer", border: "1px solid",
                    background: selectedSkills[skill] ? "rgba(76, 175, 80, 0.2)" : "rgba(255,255,255,0.1)",
                    borderColor: selectedSkills[skill] ? "#4caf50" : "rgba(255,255,255,0.2)",
                    color: selectedSkills[skill] ? "#4caf50" : "white"
                  }}
               >
                 {skill}
               </button>
             ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          style={{ marginTop: "1rem", padding: "12px", borderRadius: "8px", background: "linear-gradient(135deg, #4facfe, #00f2fe)", border: "none", color: "white", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
        >
          Save Game Configuration
        </button>

      </div>
    </motion.div>
  );
}
