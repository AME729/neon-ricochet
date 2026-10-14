/**
 * Neon Ricochet: Rogue Synth
 * Zero-Asset Procedural Web Audio API Synthesizer
 * Generates dynamic synthwave melodies, arpeggios, ricochet chimes, and bass drops.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    this.noteIndex = 0;
    this.lastBounceTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.bgmPlaying) {
      this.stopBGM();
    } else if (!this.muted && !this.bgmPlaying) {
      this.startBGM();
    }
    return this.muted;
  }

  // Harmonic ricochet chime that climbs the scale on rapid bounces
  playBounceChime(isCrit = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (now - this.lastBounceTime > 0.4) {
        this.noteIndex = 0;
      } else {
        this.noteIndex = (this.noteIndex + 1) % this.pentatonicScale.length;
      }
      this.lastBounceTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isCrit ? 'sawtooth' : 'sine';
      let freq = this.pentatonicScale[this.noteIndex];
      if (isCrit) freq *= 1.5;

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.08);

      gain.gain.setValueAtTime(isCrit ? 0.25 : 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Audio fallback protection
    }
  }

  // Wall ricochet click
  playWallBounce() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Volley launch whoosh
  playLaunch() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // Explosive bass thump on node break
  playExplosion(isBoss = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(isBoss ? 120 : 90, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + (isBoss ? 0.45 : 0.22));

      gain.gain.setValueAtTime(isBoss ? 0.4 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isBoss ? 0.45 : 0.22));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isBoss ? 0.46 : 0.23));
    } catch (e) {}
  }

  // Electric arc / lightning zap
  playLaser() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  // Level Up / Relic Select Fanfare
  playFanfare() {
    if (this.muted || !this.ctx) return;
    try {
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.muted || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.36);
        }, idx * 75);
      });
    } catch (e) {}
  }

  // Game Over Sad Down-Tone
  playGameOver() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [440, 392, 349.23, 261.63, 196];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.muted || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.32);
        }, idx * 120);
      });
    } catch (e) {}
  }

  // Background Synthwave Bassline Arpeggiator (Proc-gen 80s Cyber vibe)
  startBGM() {
    if (this.bgmPlaying || this.muted) return;
    this.bgmPlaying = true;
    let step = 0;
    const bassline = [110, 110, 130.81, 130.81, 98, 98, 146.83, 164.81];

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const freq = bassline[step % bassline.length];
        step++;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.18);

        // Very subtle background volume
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.24);
      } catch (e) {}
    }, 240);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.soundEngine = new SoundEngine();
}
