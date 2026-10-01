/**
 * Bips WebAudio générés (aucun fichier audio) — GAME_DESIGN §10.1.
 * L'AudioContext doit être créé/réveillé dans un geste utilisateur (tap « Lancer ») sur iOS.
 */

export type BeepKind = 'tick' | 'go' | 'alert' | 'end';

const BEEPS: Record<BeepKind, { freq: number; ms: number; type: OscillatorType }> = {
  tick: { freq: 660, ms: 120, type: 'sine' },
  go: { freq: 990, ms: 300, type: 'triangle' },
  alert: { freq: 880, ms: 90, type: 'sine' },
  end: { freq: 440, ms: 600, type: 'triangle' },
};

let context: AudioContext | null = null;
let enabled = true;

function getContext(): AudioContext | null {
  if (context) return context;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

export const sound = {
  setEnabled(value: boolean) {
    enabled = value;
  },
  /** À appeler dans un gestionnaire de tap : débloque l'audio sur iOS. */
  unlock() {
    const ctx = getContext();
    if (!ctx) return;
    void ctx.resume().catch(() => undefined);
    // Un son silencieux d'une frame « réveille » la sortie audio de Safari.
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
  },
  beep(kind: BeepKind) {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx || ctx.state !== 'running') return;
    const { freq, ms, type } = BEEPS[kind];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    const t1 = t0 + ms / 1000;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  },
};
