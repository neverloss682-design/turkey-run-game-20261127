// audio.js — all sound is synthesised with WebAudio. No audio files,
// no network. One job: bleeps, gobbles and jingles for every game event.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  click() { this.tone(660, 0.07, 'square', 0.06); }

  gobble() {
    // A comic gobble: four quick descending blips.
    [520, 430, 380, 300].forEach((f, i) => this.tone(f, 0.09, 'sawtooth', 0.09, f * 0.8, i * 0.09));
  }

  dash() { this.tone(300, 0.18, 'sine', 0.1, 900); }

  corn() { this.tone(880, 0.08, 'triangle', 0.12); this.tone(1320, 0.1, 'triangle', 0.1, null, 0.06); }

  powerup() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.1, null, i * 0.07)); }

  hit() { this.tone(180, 0.25, 'sawtooth', 0.16, 60); }

  blocked() { this.tone(520, 0.12, 'square', 0.1, 780); }

  spotted() { this.tone(220, 0.14, 'square', 0.09, 440); this.tone(220, 0.14, 'square', 0.09, 440, 0.16); }

  knifeWarn() { this.tone(1200, 0.06, 'square', 0.05); }

  stageClear() { [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.11, null, i * 0.1)); }

  escapeFanfare() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.12, null, i * 0.12));
  }

  caughtSting() {
    [392, 370, 349, 311].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.1, null, i * 0.18));
  }
}
