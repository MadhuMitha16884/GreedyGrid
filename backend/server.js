import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PORT (Render compatible)
const PORT = process.env.PORT || 3001;

// File path
const SCORES_FILE = path.join(__dirname, "scores.json");

// Ensure file exists (IMPORTANT)
if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// Helper: Read scores
const getScoresFromFile = () => {
  try {
    const data = fs.readFileSync(SCORES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading scores:", e);
    return [];
  }
};

// Helper: Save scores
const saveScoresToFile = (scores) => {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
  } catch (e) {
    console.error("Error saving scores:", e);
  }
};

// Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("GreedyGrid Backend is running 🚀");
});

// GET scores
app.get("/api/scores", (req, res) => {
  const { game, difficulty } = req.query;
  let scores = getScoresFromFile();

  if (game && difficulty) {
    scores = scores.filter(
      (s) => s.game === game && s.difficulty === difficulty
    );
  }

  // Sort descending
  scores.sort((a, b) => b.score - a.score);

  res.json(scores);
});

// POST score
app.post("/api/scores", (req, res) => {
  const { game, difficulty, player, score, time } = req.body;

  if (!game || !difficulty || player == null || score == null) {
    return res.status(400).json({ error: "Missing score fields" });
  }

  const scores = getScoresFromFile();

  scores.push({
    game,
    difficulty,
    player,
    score,
    time,
    date: new Date().toISOString(),
  });

  saveScoresToFile(scores);

  res.status(201).json({ message: "Score saved successfully." });
});

// Start server
app.listen(PORT, () => {
  console.log(`GreedyGrid Backend running on port ${PORT}`);
});