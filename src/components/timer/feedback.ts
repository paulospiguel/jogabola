// Audio + haptic cues with zero asset dependency (Web Audio API + Vibration API).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function beep(freq: number, durationMs: number, when = 0): void {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const start = audio.currentTime + when;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + durationMs / 1000);
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore unsupported */
    }
  }
}

/** Final whistle: triple ascending beep + long vibration. */
export function cuePeriodEnd(sound: boolean): void {
  if (sound) {
    beep(660, 160, 0);
    beep(880, 160, 0.18);
    beep(1100, 320, 0.36);
  }
  vibrate([120, 60, 120, 60, 240]);
}

/** Goal pop: quick bright beep + short vibration. */
export function cueGoal(sound: boolean): void {
  if (sound) {
    beep(880, 90, 0);
    beep(1320, 140, 0.08);
  }
  vibrate(40);
}

/** Tactile tick for control taps. */
export function cueTap(): void {
  vibrate(15);
}
