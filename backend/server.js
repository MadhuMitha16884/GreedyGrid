import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SCORES_FILE = path.join(__dirname, "scores.json");

// Helper to interact with scores file
const getScoresFromFile = () => {
  if (!fs.existsSync(SCORES_FILE)) {
    return [];
  }
  const data = fs.readFileSync(SCORES_FILE, "utf-8");
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveScoresToFile = (scores) => {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
};

// Endpoints
app.get("/api/scores", (req, res) => {
  const { game, difficulty } = req.query;
  let scores = getScoresFromFile();

  if (game && difficulty) {
    scores = scores.filter(s => s.game === game && s.difficulty === difficulty);
  }

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);

  res.json(scores);
});

app.post("/api/scores", (req, res) => {
  const { game, difficulty, player, score, time } = req.body;

  if (!game || !difficulty || player === undefined || score === undefined) {
    return res.status(400).json({ error: "Missing score fields" });
  }

  const scores = getScoresFromFile();
  scores.push({
    game,
    difficulty,
    player,
    score,
    time,
    date: new Date().toISOString()
  });

  saveScoresToFile(scores);
  res.status(201).json({ message: "Score saved successfully." });
});

app.listen(PORT, () => {
  console.log(`GreedyGrid Backend listening on http://localhost:${PORT}`);
});
