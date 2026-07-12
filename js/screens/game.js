import { Fork } from '../fork.js';
import { ScoreSystem } from '../scoreSystem.js';
import { LeaderboardManager } from '../leaderboardManager.js';

export function createGameScreen(gameManager) {
  const forkEl = document.getElementById('fork');
  const forkImg = document.getElementById('fork-img');
  const scoreLabel = document.querySelector('#screen-game .score-value');
  const timerLabel = document.querySelector('#screen-game .timer-value');

  const leaderboardList = document.querySelector('#screen-game .leaderboard-list');

  let fork;
  let scoreSystem;
  let timerInterval = null;

  return {
    onShow() {
      const lb = new LeaderboardManager();
      const scores = lb.getScores();
      leaderboardList.innerHTML = scores.map((s, i) =>
        `<li>${i + 1}. ${s.name} — ${s.score}</li>`
      ).join('');

      scoreSystem = new ScoreSystem();
      scoreSystem.reset();
      scoreLabel.textContent = '0';
      forkImg.src = 'assets/fork_fill_0.png';

      let timeLeft = 10;
      timerLabel.textContent = timeLeft;
      timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timerLabel.textContent = Math.ceil(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          gameManager.showScreen('result', scoreSystem.score);
        }
      }, 100);

      fork = new Fork(forkEl);
      fork.onWrapCompleted = (scored) => {
        if (scored) scoreLabel.textContent = scoreSystem.incrementSpeed();
      };
      fork.onUnwrapOccurred = () => {
        scoreLabel.textContent = scoreSystem.decrementScore();
      };
      fork.onFillStateChanged = (state) => {
        forkImg.src = `assets/fork_fill_${state}.png`;
        forkImg.classList.remove('punch');
        void forkImg.offsetWidth;
        forkImg.classList.add('punch');
      };
    },
    onHide() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  };
}
