export function createAttractScreen(gameManager) {
  const section = document.getElementById('screen-attract');
  let started = false;

  section.addEventListener('click', async () => {
    if (started) return;
    started = true;
    try { await document.documentElement.requestFullscreen(); } catch {}
    try { await navigator.wakeLock?.request('screen'); } catch {}
    gameManager.showScreen('countdown');
  });

  return {
    onShow() { started = false; }
  };
}
