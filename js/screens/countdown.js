export function createCountdownScreen(gameManager) {
  const label = document.querySelector('#screen-countdown .countdown-number');

  return {
    onShow() {
      let count = 3;
      label.textContent = count;
      const interval = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(interval);
          gameManager.showScreen('game');
          return;
        }
        label.textContent = count;
      }, 1000);
    }
  };
}
