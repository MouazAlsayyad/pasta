const STORAGE_KEY = 'laf-akthar-leaderboard';

export class LeaderboardManager {
  getScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  addScore(name, score) {
    const scores = this.getScores();
    scores.push({ name: name || 'Player', score, date: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
    return top10;
  }
}
