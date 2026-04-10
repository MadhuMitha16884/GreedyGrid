const API_URL = "http://localhost:3001/api/scores";

export async function getScores(game, difficulty) {
  try {
    let url = API_URL;
    if (game && difficulty) {
      url += `?game=${encodeURIComponent(game)}&difficulty=${encodeURIComponent(difficulty)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch scores");
    const scores = await response.json();
    return scores;
  } catch (e) {
    console.error("Leaderboard fetch error:", e);
    return [];
  }
}

export async function submitScore(game, difficulty, player, scoreVal, time) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, difficulty, player, score: scoreVal, time })
    });
    if (!response.ok) throw new Error("Failed to submit score");
  } catch (e) {
    console.error("Leaderboard submit error:", e);
    // Fallback: Optionally save to localStorage if backend is down
  }
}