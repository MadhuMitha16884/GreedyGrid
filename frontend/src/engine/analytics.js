const STATS_KEY = "greedy_grid_analytics";

export function trackSession({ game, difficulty, score, time, mistakes, skills }) {
  try {
    const data = JSON.parse(localStorage.getItem(STATS_KEY) || "[]");
    
    data.push({
      id: Date.now(),
      game,
      difficulty,
      score: score || 0,
      time: time || 0,
      mistakes: mistakes || 0,
      skills: skills || [],
      date: new Date().toISOString()
    });

    localStorage.setItem(STATS_KEY, JSON.stringify(data));
  } catch(e) {
    console.error("Failed to save analytics", e);
  }
}

export function getSkillProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STATS_KEY) || "[]");
    
    const skillStats = {};

    data.forEach(session => {
      if(session.skills) {
        session.skills.forEach(skill => {
          if(!skillStats[skill]) {
            skillStats[skill] = { gamesPlayed: 0, totalScore: 0, totalTime: 0, mistakes: 0 };
          }
          skillStats[skill].gamesPlayed += 1;
          skillStats[skill].totalScore += session.score;
          skillStats[skill].totalTime += session.time;
          skillStats[skill].mistakes += session.mistakes;
        });
      }
    });

    return skillStats;
  } catch(e) {
    console.error("Failed to load analytics", e);
    return {};
  }
}

export function getAllSessions() {
   try {
     return JSON.parse(localStorage.getItem(STATS_KEY) || "[]");
   } catch {
     return [];
   }
}
