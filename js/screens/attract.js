import { DialogueManager } from '../dialogueManager.js';

export function createAttractScreen(gameManager) {
  const section = document.getElementById('screen-attract');
  const bubbleEl = document.querySelector('#screen-attract .speech-bubble');
  const textEl = document.querySelector('#screen-attract .speech-bubble-text');
  const dm = new DialogueManager(bubbleEl, textEl);
  let started = false;
  let attractInterval = null;
  let attractIdx = 0;

  const LINES = [
    'هيا... من يلف أطول معكرونة؟',
    'هل تستطيع هزيمتي؟',
    'اقترب... لنرَ مهارتك!',
    'ابدأ اللف... ولنرَ من الأفضل!',
    'كل لفة تقربك من القمة!',
    'المتحدي القادم... هل أنت؟',
    'لفها... لكن لا تقطعها!',
    'جاهز لأطول معكرونة؟',
  ];

  section.addEventListener('click', async () => {
    if (started) return;
    started = true;
    try { await document.documentElement.requestFullscreen(); } catch {}
    try { await navigator.wakeLock?.request('screen'); } catch {}
    gameManager.showScreen('countdown');
  });

  return {
    onShow() {
      started = false;
      dm.showPersistent(LINES[0]);
      attractIdx = 1;
      attractInterval = setInterval(() => {
        dm.showPersistent(LINES[attractIdx % LINES.length]);
        attractIdx++;
      }, 4000);
    },
    onHide() {
      clearInterval(attractInterval);
      attractInterval = null;
      dm.hide();
    }
  };
}
