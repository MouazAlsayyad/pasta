# لف أكثر! (Laf Akthar!) — Build Plan

## Stack & Assumptions

- **Vanilla HTML + CSS + JS, no framework, no Canvas.** The whole game is angle tracking on a pointer drag, a discrete sprite swap by threshold, and a timer. No physics, no particles, nothing needing Canvas or WebGL.
- **Target: a touchscreen kiosk browser** (Chrome/Edge in kiosk mode), not a general public website.
- **No backend.** Leaderboard persists via `localStorage`. If the kiosk browser profile gets wiped between events, `localStorage` gets wiped too. Accepted for MVP.

## The Mechanic

```
On full 360° clockwise drag around fork center:
  wrap_count += 1  (always)
  IF angular_velocity >= MIN_SPEED at completion: score += 1
  ELSE: score unchanged
  fill_state recalculated from wrap_count via threshold table

On full 360° counter-clockwise drag:
  wrap_count -= 1 (floor 0), fill_state recalculated down
  IF that wrap had scored: score -= 1 (floor 0)

No speed penalty for going fast. No snap. No fail state.
Round ends only when the timer hits zero.
```

- `MIN_SPEED = 1.0 rad/s`
- Threshold table (7 states, 0–6):
  ```js
  const FILL_THRESHOLDS = [3, 8, 15, 24, 35, 48]; // cumulative wraps to reach state i+1
  ```
- 48-wrap ceiling in 10s was never playtested — tune thresholds after testing.

## Screen Flow

```
Attract → Countdown (3s) → Game (10s) → Result (6s auto-advance or Skip btn) → Attract
```

- **Attract:** full-rect centered "المس للبدء" label, tap anywhere starts the round.
- **Countdown:** 3 → 2 → 1, tick-timer pattern.
- **Game:** fork + score panel (bottom-center) + leaderboard panel (always visible, right side) + chef (bottom-left) + timer framed by `time_box.png`.
- **Result:** leaderboard panel (stacked above score) + score label + name input (max 10 chars) + Save button + Skip button. Auto-advances after 6s regardless of whether a name was entered (defaults to "Player"). Save saves early and refreshes the list but does not skip the wait. Skip returns to Attract immediately without saving.

## Project Structure

```
pasta/
├── index.html
├── style.css
├── js/
│   ├── gameManager.js          # screen/phase transitions
│   ├── fork.js                 # rotation tracking, wrap/fill logic
│   ├── scoreSystem.js          # score increment/decrement
│   ├── leaderboardManager.js   # localStorage persistence
│   └── screens/
│       ├── attract.js
│       ├── countdown.js
│       ├── game.js
│       └── result.js
├── assets/
│   ├── bg.png                  # full viewport background (all screens)
│   ├── chef.png                # decorative, bottom-left (Game + Result)
│   ├── fork_fill_0.png ~ fork_fill_6.png  # 7 fork fill states
│   ├── Leaderboard.png         # leaderboard panel header
│   ├── time_box.png            # timer display frame (Game screen)
│   └── (unused: chat.png, arrow_direction.png, path.png, Smiling face.png, hand.png, 13.png)
└── fonts/                      # Arabic webfont (Cairo / Tajawal / Noto Naskh Arabic)
```

Each screen is a `<section>` in `index.html`, shown/hidden by `gameManager.js`. Same phase-gating rule as Godot: "GameManager is the only thing that decides scene transitions." Implemented as toggling a `.hidden` CSS class.

---

## Phase 1: Skeleton Screens

### 1.1 Create `index.html`
- `<html lang="ar" dir="rtl">`
- 4 `<section>` elements: `#screen-attract`, `#screen-countdown`, `#screen-game`, `#screen-result`
- All sections have `.hidden` class by default except Attract
- Google Fonts link for Cairo or Tajawal
- Script import: `<script type="module" src="js/gameManager.js"></script>`

### 1.2 Create `style.css`
- `body`: `bg.png` full-viewport, `background-size: cover`, `background-position: center`, no repeat
- Each `section`: `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center`
- `.hidden`: `display: none !important`
- Layout:
  - Fork: bottom-center in Game screen, center in Result screen
  - Chef: `position: fixed; bottom: 0; left: 0`
  - Leaderboard panel: right side in Game, stacked in Result
  - Score panel: bottom-center (not flush to bottom)
  - Timer: framed by `time_box.png`
- `.punch` animation for sprite swap:
  ```css
  .punch {
    animation: punch 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes punch {
    0%   { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  ```
- Kiosk hardening CSS (placed early, active from the start):
  - `touch-action: none` on the fork / game area
  - `overscroll-behavior: none` on `<html>`
  - `user-select: none` on `<body>`
  - `-webkit-touch-callout: none`

### 1.3 Create `js/gameManager.js`
```js
export class GameManager {
  constructor() {
    this.screens = {};
    this.currentScreen = null;
  }

  register(name, screenModule) {
    this.screens[name] = screenModule;
  }

  showScreen(name) {
    // hide all sections
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    // show target
    const section = document.getElementById(`screen-${name}`);
    if (section) section.classList.remove('hidden');
    // notify screen module
    this.screens[name]?.onShow?.();
    this.currentScreen = name;
  }
}
```

### 1.4 Create `js/screens/attract.js`
```js
export function createAttractScreen(gameManager) {
  const section = document.getElementById('screen-attract');
  let started = false;

  section.addEventListener('click', async () => {
    if (started) return;
    started = true;
    // Fullscreen on first interaction (required by browser)
    try { await document.documentElement.requestFullscreen(); } catch {}
    // Wake lock so the kiosk display doesn't sleep
    try { await navigator.wakeLock?.request('screen'); } catch {}
    gameManager.showScreen('countdown');
  });

  return {
    onShow() { started = false; }
  };
}
```

### 1.5 Create `js/screens/countdown.js`
```js
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
```

### 1.6 Create `js/screens/game.js`
- Placeholder shell: `createGameScreen(gameManager)` returns `{ onShow() { ... } }`
- Will initialize Fork, ScoreSystem, timer, leaderboard in Phase 2–5

### 1.7 Create `js/screens/result.js`
- Placeholder shell: `createResultScreen(gameManager)` returns `{ onShow(score) { ... } }`
- Will wire leaderboard, name input, Save, Skip, auto-advance in Phase 5

---

## Phase 2: Fork Rotation + Fill Swap

### 2.1 Create `js/fork.js` — Full Class

```js
export class Fork {
  constructor(element) {
    this.el = element;
    this.minSpeed = 1.0;
    this.fillThresholds = [3, 8, 15, 24, 35, 48];

    this.activePointerId = null;
    this.previousAngle = 0;
    this.previousTimeMs = 0;
    this.accumulatedAngle = 0;

    this.angularVelocity = 0;
    this.wrapCount = 0;
    this.fillState = 0;
    this.lastScored = false;

    this.onWrapCompleted = null;
    this.onUnwrapOccurred = null;
    this.onFillStateChanged = null;

    this.el.addEventListener('pointerdown', (e) => this._startTouch(e));
    this.el.addEventListener('pointermove', (e) => this._updateTouch(e));
    this.el.addEventListener('pointerup', (e) => this._endTouch(e));
    this.el.addEventListener('pointercancel', (e) => this._endTouch(e));
  }

  _angleFromEvent(e) {
    const rect = this.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  }

  _startTouch(e) {
    if (this.activePointerId !== null) return;
    this.activePointerId = e.pointerId;
    this.el.setPointerCapture(e.pointerId);
    this.previousAngle = this._angleFromEvent(e);
    this.previousTimeMs = performance.now();
  }

  _endTouch(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    this.angularVelocity = 0;
  }

  _updateTouch(e) {
    if (e.pointerId !== this.activePointerId) return;

    const currentAngle = this._angleFromEvent(e);
    const currentTimeMs = performance.now();
    const dt = (currentTimeMs - this.previousTimeMs) / 1000;
    this.previousTimeMs = currentTimeMs;
    if (dt <= 0) return;

    let deltaAngle = currentAngle - this.previousAngle;
    deltaAngle = Math.atan2(Math.sin(deltaAngle), Math.cos(deltaAngle));
    this.previousAngle = currentAngle;

    this.angularVelocity = deltaAngle / dt;
    this.accumulatedAngle += deltaAngle;

    const TAU = Math.PI * 2;
    if (this.accumulatedAngle >= TAU) {
      this.accumulatedAngle -= TAU;
      this._completeWrap(this.angularVelocity >= this.minSpeed);
    } else if (this.accumulatedAngle <= -TAU) {
      this.accumulatedAngle += TAU;
      this._completeUnwrap();
    }
  }

  _completeWrap(scored) {
    this.wrapCount += 1;
    this.lastScored = scored;
    this.onWrapCompleted?.(scored);
    this._updateFillState();
  }

  _completeUnwrap() {
    if (this.wrapCount > 0) {
      this.wrapCount -= 1;
      this._updateFillState();
      this.onUnwrapOccurred?.();
    }
  }

  _updateFillState(maxFrame = this.fillThresholds.length) {
    let newState = 0;
    for (let i = 0; i < this.fillThresholds.length; i++) {
      if (this.wrapCount >= this.fillThresholds[i]) newState = i + 1;
    }
    newState = Math.min(Math.max(newState, 0), maxFrame);
    if (newState !== this.fillState) {
      this.fillState = newState;
      this.onFillStateChanged?.(this.fillState);
    }
  }
}
```

Key implementation notes:
- **`performance.now()`, not `Date.now()`** — monotonic, can't jump backward on clock adjustments
- **Pointer capture + `activePointerId` guard** — prevents second finger from corrupting angle math on a busy kiosk
- **`_updateFillState` loops every threshold** — a fast player can cross two thresholds in one `pointermove` event; full loop catches that
- `_updateFillState` clamps against `fillThresholds.length`, which must be kept in sync with the actual number of `fork_fill_N.png` files manually

### 2.2 Sprite Swap Wiring

```js
fork.onFillStateChanged = (state) => {
  forkImg.src = `assets/fork_fill_${state}.png`;
  forkImg.classList.remove('punch');
  void forkImg.offsetWidth; // force reflow so the animation restarts
  forkImg.classList.add('punch');
};
```

### 2.3 Temporary Debug Overlay
- Show `wrapCount`, `fillState`, `angularVelocity` on screen during development
- **Must be explicitly removed before demo** — track this, don't let it become a "never confirmed" item

---

## Phase 3: Scoring

### 3.1 Create `js/scoreSystem.js`

```js
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
```

Wiring: when `fork.onWrapCompleted` fires with `scored = true`, call `scoreSystem.incrementSpeed()`. When `fork.onUnwrapOccurred` fires, call `scoreSystem.decrementScore()`.

---

## Phase 4: Timer + Round End

### 4.1 Create 10s Countdown in `js/screens/game.js`

```js
export function createGameScreen(gameManager) {
  const timerLabel = document.querySelector('#screen-game .timer-value');
  const scoreLabel = document.querySelector('#screen-game .score-value');
  let fork, scoreSystem, timerInterval;

  return {
    onShow() {
      // Reset
      scoreSystem = new ScoreSystem();
      scoreLabel.textContent = '0';

      // Start timer
      let timeLeft = 10;
      timerLabel.textContent = timeLeft;
      timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timerLabel.textContent = Math.ceil(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          gameManager.showScreen('result', scoreSystem.score);
        }
      }, 100);

      // Init fork
      const forkEl = document.getElementById('fork');
      fork = new Fork(forkEl);
      fork.onWrapCompleted = (scored) => {
        if (scored) scoreLabel.textContent = scoreSystem.incrementSpeed();
      };
      fork.onUnwrapOccurred = () => {
        scoreLabel.textContent = scoreSystem.decrementScore();
      };
      fork.onFillStateChanged = (state) => {
        const img = document.getElementById('fork-img');
        img.src = `assets/fork_fill_${state}.png`;
        img.classList.remove('punch');
        void img.offsetWidth;
        img.classList.add('punch');
      };
    }
  };
}
```

Timer displays inside `time_box.png` frame. Timer runs at 100ms interval for smooth ceiling display. On expiry, transition to Result with final score.

---

## Phase 5: Leaderboard

### 5.1 Create `js/leaderboardManager.js`

```js
const STORAGE_KEY = 'laf-akthar-leaderboard';

export class LeaderboardManager {
  getScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      // Corrupted localStorage entry — reset
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  addScore(name, score) {
    const scores = this.getScores();
    scores.push({ name: name || 'Player', score, date: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
    return top10;
  }
}
```

### 5.2 Wire into `js/screens/result.js`

```js
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

      // Auto-advance after 6s
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
```

---

## Phase 6: Kiosk Hardening

### 6.1 Fullscreen
- Requested in Attract screen's first tap handler via `document.documentElement.requestFullscreen()`
- Browser requires a user gesture — the same tap that starts the round satisfies this

### 6.2 CSS Guards
- `touch-action: none` on the fork container/`#screen-game` → prevents pinch-zoom/pan
- `overscroll-behavior: none` on `<html>` → prevents pull-to-refresh
- `user-select: none` on `<body>` → prevents text selection
- `-webkit-touch-callout: none` → prevents long-press context menu

### 6.3 Screen Wake Lock
- `navigator.wakeLock.request('screen')` in Attract's tap handler
- Prevents kiosk display from sleeping mid-attract-loop

### 6.4 Browser Launch Flags (venue setup)
- Launch Chrome/Edge with: `--kiosk --noerrdialogs --disable-pinch`
- `--kiosk` is preferred over Fullscreen API alone — the API can be exited with Esc, the launch flag can't

### 6.5 Idle/Abandoned-Round Recovery
- If someone starts a round and walks away, the 10s timer still runs to completion
- This is acceptable — same gap exists in the Godot version

---

## Phase 7: Arabic/RTL + Font

- `<html lang="ar" dir="rtl">` — whole page is Arabic
- Load an Arabic-supporting webfont explicitly via Google Fonts: Cairo, Tajawal, or Noto Naskh Arabic
- Set as primary `font-family` on `<body>` — without this, kiosk hardware with no Arabic system font will render boxes
- **Test on the target kiosk hardware/browser before calling done** — "looks right in dev browser" ≠ "looks right on the kiosk"

---

## Phase 8: Polish & Cleanup

### 8.1 Remove Debug Overlay
- Remove the temporary wrapCount/fillState/angularVelocity display
- Track this explicitly — don't let it become an unresolved carry-over like the Godot build's `DebugLabel`

### 8.2 Verify Sprite Count Sync
- Confirm `FILL_THRESHOLDS.length` (6 thresholds → 7 states 0–6) matches actual files: `fork_fill_0.png` to `fork_fill_6.png`
- No runtime check exists — must be kept in sync manually

### 8.3 Exclude Unused Assets
- `chat.png`, `arrow_direction.png`, `path.png`, `Smiling face.png`, `hand.png`, `13.png` — confirmed unused, leave in assets folder but don't load

### 8.4 Playtest Thresholds
- 48 wraps in 10s was never playtested
- Adjust `FILL_THRESHOLDS` array if the ceiling is unreachable or too easy

---

## Things That Will Break If You Assume 1:1 Parity With Godot

- **No autoload registration step.** JS modules are just `import`ed. A typo'd import path fails at load time in the console only. Check the console, don't assume it loaded.
- **Persistence format.** `FileAccess` → `localStorage`. `localStorage` only stores strings — `JSON.parse` wrapped in try/catch (handled in `leaderboardManager.js` above).
- **Multi-touch.** Brand new failure mode on web, handled by `activePointerId` guard in `Fork`.
- **Sprite frame count clamp.** No Godot-equivalent runtime check. `FILL_THRESHOLDS.length` and the actual number of `fork_fill_N.png` files must be kept in sync by hand.
