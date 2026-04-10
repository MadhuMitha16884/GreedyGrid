import { getAllSessions } from "./analytics";

/**
 * Returns a recommended difficulty based on recent performance.
 * @param {string} gameKey The type of game (e.g. 'sudoku', '2048')
 * @param {string} currentDifficulty The player's current difficulty setting
 * @returns {string} The recommended difficulty: 'easy', 'medium', or 'hard'
 */
export function getAdaptiveDifficulty(gameKey, currentDifficulty) {
  const sessions = getAllSessions().filter(s => s.game === gameKey);
  
  if (sessions.length < 3) return currentDifficulty || "easy";

  // Look at the last 3 sessions
  const recent = sessions.slice(-3);
  let totalMistakes = 0;
  let totalScore = 0;
  
  recent.forEach(s => {
    totalMistakes += s.mistakes;
    totalScore += s.score;
  });

  const avgMistakes = totalMistakes / recent.length;

  const levels = ["easy", "medium", "hard"];
  let currentIndex = levels.indexOf(currentDifficulty || "easy");
  if(currentIndex === -1) currentIndex = 0;

  // Simple adaptive logic
  if (avgMistakes === 0 && totalScore > 0) {
    // High performance -> harder
    currentIndex = Math.min(currentIndex + 1, levels.length - 1);
  } else if (avgMistakes > 3) {
    // Low performance -> easier
    currentIndex = Math.max(currentIndex - 1, 0);
  }

  return levels[currentIndex];
}
