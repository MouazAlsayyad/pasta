import { Fork } from '../fork.js';

export function createGameScreen(gameManager) {
  const forkEl = document.getElementById('fork');
  const forkImg = document.getElementById('fork-img');
  const scoreLabel = document.querySelector('#screen-game .score-value');

  const debugWraps = document.getElementById('debug-wraps');
  const debugFill = document.getElementById('debug-fill');
  const debugOmega = document.getElementById('debug-omega');

  let fork;
  let score = 0;
  let rafId = null;

  function updateDebug() {
    if (!fork) return;
    debugWraps.textContent = fork.wrapCount;
    debugFill.textContent = fork.fillState;
    debugOmega.textContent = fork.angularVelocity.toFixed(2);
    rafId = requestAnimationFrame(updateDebug);
  }

  return {
    onShow() {
      score = 0;
      scoreLabel.textContent = '0';
      forkImg.src = 'assets/fork_fill_0.png';

      fork = new Fork(forkEl);
      fork.onWrapCompleted = (scored) => {
        if (scored) {
          score += 1;
          scoreLabel.textContent = score;
        }
      };
      fork.onUnwrapOccurred = () => {
        score = Math.max(0, score - 1);
        scoreLabel.textContent = score;
      };
      fork.onFillStateChanged = (state) => {
        forkImg.src = `assets/fork_fill_${state}.png`;
        forkImg.classList.remove('punch');
        void forkImg.offsetWidth;
        forkImg.classList.add('punch');
      };

      rafId = requestAnimationFrame(updateDebug);
    },
    onHide() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
