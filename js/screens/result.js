import { LeaderboardManager } from '../leaderboardManager.js';
import { DialogueManager } from '../dialogueManager.js';

export function createResultScreen(gameManager) {
  const lbRows = document.querySelector('#screen-result .lb-rows');
  const scoreLabel = document.querySelector('#screen-result .score-value');
  const nameInput = document.querySelector('#screen-result .name-input');
  const saveBtn = document.querySelector('#screen-result .save-btn');
  const skipBtn = document.querySelector('#screen-result .skip-btn');
  const bubbleEl = document.querySelector('#screen-result .speech-bubble');
  const textEl = document.querySelector('#screen-result .speech-bubble-text');
  const dm = new DialogueManager(bubbleEl, textEl);
  let currentScore = 0;
  let autoTimer = null;
  let saved = false;

  const lb = new LeaderboardManager();

  function renderLeaderboard() {
    const scores = lb.getScores();
    const ROW_TOPS = [12.36, 20.77, 29.18, 37.60, 45.93, 54.34, 62.49, 70.82, 78.61, 86.94];
    lbRows.innerHTML = ROW_TOPS.map((top, i) => {
      const entry = scores[i];
      if (!entry) return '';
      const name = document.createElement('div');
      name.textContent = entry.name;
      return `<div class="lb-row" style="top:${top}%;animation-delay:${i * 50}ms">
        <span class="lb-name">${name.innerHTML}</span>
        <span class="lb-score">${entry.score}</span>
      </div>`;
    }).join('');
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

      const scores = lb.getScores();
      const topScore = scores[0]?.score || 0;
      if (score > topScore) {
        dm.show('new_high_score');
      } else if (scores.length < 10 || score > scores[scores.length - 1].score) {
        dm.show('leaderboard_entry');
      }

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
