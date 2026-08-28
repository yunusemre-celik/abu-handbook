/**
 * Sound Manager - Handles page turn audio effects with Web Audio API synthesis and audio file fallback
 */

class SoundManager {
  constructor() {
    this.isEnabled = localStorage.getItem('flipbook_sound_enabled') !== 'false'; // Default: enabled
    this.audioContext = null;
  }

  initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('flipbook_sound_enabled', this.isEnabled);
    return this.isEnabled;
  }

  playFlip() {
    if (!this.isEnabled) return;

    try {
      this.initAudioContext();
      if (!this.audioContext) return;

      // Synthesize realistic crisp paper rustle / whoosh using bandpass filtered noise
      const bufferSize = this.audioContext.sampleRate * 0.12; // 120ms duration
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate soft pink/brownish noise burst
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain boost
      }

      const whiteNoise = this.audioContext.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filter to simulate paper surface frequency
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, this.audioContext.currentTime + 0.06);
      filter.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.12);
      filter.Q.value = 1.8;

      // Volume envelope
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      whiteNoise.start();
    } catch (e) {
      console.warn('Audio effect error:', e);
    }
  }
}

export const soundManager = new SoundManager();
