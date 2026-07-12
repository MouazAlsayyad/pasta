import { DialogueManager } from '../dialogueManager.js';

const LINES = {
  3: 'استعد!',
  2: 'أمسك الشوكة!',
  1: 'ابدأ اللف!',
};

export function createCountdownScreen(gameManager) {
  const label = document.querySelector('#screen-countdown .countdown-number');
  const bubbleEl = document.querySelector('#screen-countdown .speech-bubble');
  const textEl = document.querySelector('#screen-countdown .speech-bubble-text');
  const dm = new DialogueManager(bubbleEl, textEl);

  return {
    onShow() {
      let count = 3;
      label.textContent = count;
      dm.showLine(LINES[count], 1200);
      const interval = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(interval);
          dm.hide();
          gameManager.showScreen('game');
          return;
        }
        label.textContent = count;
        dm.showLine(LINES[count], 1200);
      }, 1000);
    }
  };
}
