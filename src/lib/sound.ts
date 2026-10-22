// Web Audio API Synthesizer for friendly educational sound effects without external assets

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  // Cheerful chime when a child answers correctly
  correct: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.36);
      });
    } catch {
      // Audio not supported or blocked
    }
  },

  // Soft encouraging sound on incorrect answer (gentle, warm, never punitive)
  encourage: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [440, 392]; // A4 down to G4 gently
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + index * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.32);
      });
    } catch {
      // Audio not supported
    }
  },

  // Star celebration fanfare
  star: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const melody = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.09 },
        { freq: 783.99, time: 0.18 },
        { freq: 987.77, time: 0.27 },
        { freq: 1046.5, time: 0.36 },
        { freq: 1318.5, time: 0.48 }
      ];
      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.freq, ctx.currentTime + item.time);

        gain.gain.setValueAtTime(0, ctx.currentTime + item.time);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + item.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.time + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + item.time);
        osc.stop(ctx.currentTime + item.time + 0.42);
      });
    } catch {
      // Audio not supported
    }
  },

  // Friendly robot chirp/blip when robot is activated
  robotChirp: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio not supported
    }
  }
};
