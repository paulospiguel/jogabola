export const playWhistle = () => {
  // Safety check for environments without AudioContext
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    console.warn("AudioContext not supported in this browser.");
    return;
  }

  try {
    const ctx = new AudioContextClass();
    const t = ctx.currentTime;
    
    // Master Gain for Envelope
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    
    // Envelope: Attack -> Sustain -> Release
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.05); // Fast attack
    gain.gain.setValueAtTime(0.8, t + 0.6); // Sustain
    gain.gain.linearRampToValueAtTime(0, t + 0.8); // Release

    // Oscillator 1: Main Tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2500, t);
    osc1.frequency.linearRampToValueAtTime(2000, t + 0.8); // Slight frequency drop
    osc1.connect(gain);

    // Oscillator 2: Detuned Tone (Creates the rolling 'pea whistle' trill effect)
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2650, t); // ~150Hz beat frequency
    osc2.frequency.linearRampToValueAtTime(2150, t + 0.8);
    osc2.connect(gain);

    osc1.start(t);
    osc2.start(t);
    
    osc1.stop(t + 0.8);
    osc2.stop(t + 0.8);
    
    // Automatic cleanup
    setTimeout(() => {
        if(ctx.state !== 'closed') ctx.close();
    }, 1000);
  } catch (error) {
    console.error("Failed to play whistle sound:", error);
  }
};