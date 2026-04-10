const API_URL = "https://greedygrid-backend.onrender.com/api/scores";

export async function getScores(game, difficulty) {
  try {
    let url = API_URL;

    if (game && difficulty) {
      url += `?game=${encodeURIComponent(game)}&difficulty=${encodeURIComponent(difficulty)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch scores");

    return await response.json();
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
      body: JSON.stringify({
        game,
        difficulty,
        player,
        score: scoreVal,
        time
      })
    });

    if (!response.ok) throw new Error("Failed to submit score");

    return await response.json(); // ✅ added
  } catch (e) {
    console.error("Leaderboard submit error:", e);
    return { success: false }; // ✅ added
  }
}