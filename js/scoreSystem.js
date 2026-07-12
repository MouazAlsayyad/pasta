export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.minSpeed = 1.0;
  }

  incrementSpeed() {
    this.score += 1;
    return this.score;
  }

  decrementScore() {
    this.score = Math.max(0, this.score - 1);
    return this.score;
  }

  reset() {
    this.score = 0;
  }
}
