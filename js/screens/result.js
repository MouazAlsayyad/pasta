import { LeaderboardManager } from '../leaderboardManager.js';

export function createResultScreen(gameManager) {
  const leaderboardList = document.querySelector('#screen-result .leaderboard-list');
  const scoreLabel = document.querySelector('#screen-result .score-value');
  const nameInput = document.querySelector('#screen-result .name-input');
  const saveBtn = document.querySelector('#screen-result .save-btn');
  const skipBtn = document.querySelector('#screen-result .skip-btn');
  let currentScore = 0;
  let autoTimer = null;
  let saved = false;

  const lb = new LeaderboardManager();

  function renderLeaderboard() {
    const scores = lb.getScores();
    leaderboardList.innerHTML = scores.map((s, i) =>
      `<li>${i + 1}. ${s.name} — ${s.score}</li>`
    ).join('');
  }

  function goToAttract() {
    if (autoTimer) clearTimeout(autoTimer);
    saved = true;
    gameManager.showScreen('attract');
  }

  return {
    onShow(score) {
      currentScore = score;
      saved = false;
      scoreLabel.textContent = score;
      nameInput.value = '';
      renderLeaderboard();

      autoTimer = setTimeout(() => {
        if (!saved) {
          lb.addScore(nameInput.value || 'Player', currentScore);
          saved = true;
        }
        gameManager.showScreen('attract');
      }, 6000);

      saveBtn.onclick = () => {
        if (saved) return;
        lb.addScore(nameInput.value || 'Player', currentScore);
        saved = true;
        renderLeaderboard();
      };

      skipBtn.onclick = goToAttract;
    }
  };
}
