const LINES = {
  attract_screen: [
    'هيا... من يلف أطول معكرونة؟',
    'هل تستطيع هزيمتي؟',
    'اقترب... لنرَ مهارتك!',
    'ابدأ اللف... ولنرَ من الأفضل!',
    'كل لفة تقربك من القمة!',
    'المتحدي القادم... هل أنت؟',
    'لفها... لكن لا تقطعها!',
    'جاهز لأطول معكرونة؟',
  ],
  countdown: {
    3: 'استعد!',
    2: 'أمسك الشوكة!',
    1: 'ابدأ اللف!',
  },
  good_coil: [
    'ممتاز!',
    'استمر!',
    'رائع!',
    'أحسنت!',
    'لفّة جميلة!',
    'إيقاع ممتاز!',
    'هكذا تمامًا!',
  ],
  length_milestone: [
    'المعكرونة تكبر!',
    'لا تتوقف!',
    'أطول... أطول!',
    'رقم رائع!',
    'استمر بنفس الإيقاع!',
  ],
  time_up: [
    'انتهى الوقت!',
    'أداء رائع!',
    'لنرَ النتيجة!',
    'كم بلغ طولها؟',
  ],
  new_high_score: [
    'رقم قياسي جديد!',
    'أنت البطل!',
    'مذهل!',
    'لا أحد سبقك!',
    'أصبحت في القمة!',
    'يا لها من مهارة!',
  ],
  leaderboard_entry: [
    'أهلاً بك بين الأبطال!',
    'اسمك سيبقى هنا!',
    'لقد وصلت إلى أفضل اللاعبين!',
  ],
};

export class DialogueManager {
  constructor(bubbleEl, textEl) {
    this.bubbleEl = bubbleEl;
    this.textEl = textEl;
    this.lastLine = new Map();
    this.hideTimer = null;
  }

  getLine(trigger) {
    const lines = LINES[trigger];
    if (!lines || lines.length === 0) return '';
    if (!Array.isArray(lines)) {
      return lines;
    }
    const last = this.lastLine.get(trigger);
    let idx;
    do {
      idx = Math.floor(Math.random() * lines.length);
    } while (idx === last && lines.length > 1);
    this.lastLine.set(trigger, idx);
    return lines[idx];
  }

  show(trigger, duration = 2500) {
    const text = this.getLine(trigger);
    this.textEl.textContent = text;
    clearTimeout(this.hideTimer);
    this.bubbleEl.classList.add('visible');
    this.hideTimer = setTimeout(() => this.hide(), duration);
  }

  showLine(text, duration = 2500) {
    this.textEl.textContent = text;
    clearTimeout(this.hideTimer);
    this.bubbleEl.classList.add('visible');
    this.hideTimer = setTimeout(() => this.hide(), duration);
  }

  showPersistent(text) {
    this.textEl.textContent = text;
    clearTimeout(this.hideTimer);
    this.bubbleEl.classList.add('visible');
  }

  hide() {
    clearTimeout(this.hideTimer);
    this.hideTimer = null;
    this.bubbleEl.classList.remove('visible');
  }
}
