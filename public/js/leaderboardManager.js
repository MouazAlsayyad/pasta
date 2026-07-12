export class LeaderboardManager {
  constructor() {
    this.cached = null;
    this.promise = null;
  }

  async _load() {
    if (!this.promise) {
      this.promise = this._fetch();
    }
    return this.promise;
  }

  async _fetch() {
    try {
      const res = await fetch('/api/players');
      this.cached = await res.json();
    } catch {
      this.cached = [];
    }
    return this.cached;
  }

  async getAllPlayers() {
    await this._load();
    return this.cached;
  }

  async getTop10() {
    await this._load();
    return this.cached.slice(0, 10);
  }

  async getScores() {
    return this.getTop10();
  }

  async addPlayer(name, score) {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, date: new Date().toISOString() }),
    });
    const players = await res.json();
    this.cached = players;
    return players;
  }
}
