// Pleasant Web Audio API notification chime
let audioCtx = null;

export const playNotificationSound = () => {
  try {
    if (typeof window === "undefined") return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Create a sweet two-tone chime
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Notes: C6 (1046.5Hz) then E6 (1318.5Hz)
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6

    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.16); // A6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch (err) {
    // Audio context may be restricted before user gesture
    console.debug("Audio chime skipped:", err.message);
  }
};

let activeRingtoneTimer = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// WhatsApp-style melodic incoming ringtone
export const startIncomingRingtone = () => {
  stopCallAudio();

  const playChord = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Notes: G#5, B5, E6, G#6 (WhatsApp-like bright marimba arpeggio)
      const freqs = [830.61, 987.77, 1318.51, 1661.22];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } catch (e) {
      console.debug("Ringtone error:", e.message);
    }
  };

  playChord();
  activeRingtoneTimer = setInterval(playChord, 1800);
};

// WhatsApp-style outgoing calling dial tone
export const startOutgoingRingtone = () => {
  stopCallAudio();

  const playDialTone = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.0);
      osc2.start(now);
      osc2.stop(now + 1.0);
    } catch (e) {
      console.debug("Dial tone error:", e.message);
    }
  };

  playDialTone();
  activeRingtoneTimer = setInterval(playDialTone, 2800);
};

// End call sound (descending two-tone)
export const playCallEndSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {}
};

// Stop all call audio loops
export const stopCallAudio = () => {
  if (activeRingtoneTimer) {
    clearInterval(activeRingtoneTimer);
    activeRingtoneTimer = null;
  }
};

