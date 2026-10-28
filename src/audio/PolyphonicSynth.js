export class PolyphonicSynth {
  constructor(maxVoices = 8) {
    this.ctx = null;
    this.maxVoices = maxVoices;
    this.voices = new Map();
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported.");
      }

      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === "suspended") {
      return this.ctx.resume();
    }
  }

  noteOn(midi, freqHz) {
    this.init();

    if (this.voices.has(midi)) {
      return;
    }

    if (this.voices.size >= this.maxVoices) {
      // FIFO voice stealing: giải phóng voice cũ nhất trước.
      const oldestMidi = this.voices.keys().next().value;
      this.noteOff(oldestMidi);
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freqHz, now);

    // Attack 20ms: ramp gain từ 0 để chống click/pop.
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);

    this.voices.set(midi, { osc, gain });
  }

  noteOff(midi) {
    const voice = this.voices.get(midi);

    if (!voice) {
      return;
    }

    const now = this.ctx.currentTime;
    const gainParam = voice.gain.gain;

    // Release exponential 50ms giúp âm thanh tắt mượt, tránh click.
    gainParam.cancelScheduledValues(now);
    gainParam.setValueAtTime(gainParam.value, now);
    gainParam.exponentialRampToValueAtTime(0.001, now + 0.05);

    voice.osc.onended = () => {
      voice.osc.disconnect();
      voice.gain.disconnect();
    };

    voice.osc.stop(now + 0.05);

    this.voices.delete(midi);
  }

  allNotesOff() {
    // Sao chép danh sách key để tránh thay đổi Map khi lặp.
    for (const midi of [...this.voices.keys()]) {
      this.noteOff(midi);
    }
  }

  destroy() {
    this.allNotesOff();

    if (this.ctx) {
      const ctx = this.ctx;
      this.ctx = null;
      return ctx.close();
    }
  }
}
