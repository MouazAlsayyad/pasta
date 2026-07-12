import { createAttractScreen } from './screens/attract.js';
import { createCountdownScreen } from './screens/countdown.js';
import { createGameScreen } from './screens/game.js';
import { createResultScreen } from './screens/result.js';

export class GameManager {
  constructor() {
    this.screens = {};
    this.currentScreen = null;
  }

  register(name, screenModule) {
    this.screens[name] = screenModule;
  }

  showScreen(name, ...args) {
    this.screens[this.currentScreen]?.onHide?.();
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById(`screen-${name}`);
    if (section) section.classList.remove('hidden');
    this.screens[name]?.onShow?.(...args);
    this.currentScreen = name;
  }
}

const gameManager = new GameManager();

gameManager.register('attract', createAttractScreen(gameManager));
gameManager.register('countdown', createCountdownScreen(gameManager));
gameManager.register('game', createGameScreen(gameManager));
gameManager.register('result', createResultScreen(gameManager));
