function normalizeAngleDelta(delta) {
  delta = delta % (2 * Math.PI);
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta <= -Math.PI) delta += 2 * Math.PI;
  return delta;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

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
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
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

    const deltaAngle = normalizeAngleDelta(currentAngle - this.previousAngle);
    this.previousAngle = currentAngle;

    this.angularVelocity = deltaAngle / dt;

    const TAU = 2 * Math.PI;
    const prevWraps = Math.trunc(this.accumulatedAngle / TAU);
    this.accumulatedAngle += deltaAngle;
    const currWraps = Math.trunc(this.accumulatedAngle / TAU);

    const wrapDelta = currWraps - prevWraps;
    if (wrapDelta > 0) {
      for (let i = 0; i < wrapDelta; i++) {
        this._completeWrap(this.angularVelocity >= this.minSpeed);
      }
    } else if (wrapDelta < 0) {
      for (let i = 0; i < -wrapDelta; i++) {
        this._completeUnwrap();
      }
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
