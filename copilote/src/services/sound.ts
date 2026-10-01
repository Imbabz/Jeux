/**
 * Bips WebAudio générés (aucun fichier audio) — GAME_DESIGN §10.1.
 * Sur iOS :
 * - l'AudioContext ne démarre que dans un geste utilisateur, et Safari le suspend
 *   (état « interrupted ») après une mise en veille ou un appel : on le réveille à chaque tap ;
 * - par défaut, le bouton silencieux coupe WebAudio : la session audio passe en « playback »
 *   (Safari 17+), comme un lecteur de musique, pour que les bips sortent aussi via CarPlay/Bluetooth.
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
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) nav.audioSession.type = 'playback';
  context = new Ctor();
  return context;
}

let listening = false;

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
  /** Réveille l'audio à chaque tap, n'importe où dans l'app (à appeler une fois au démarrage). */
  listen() {
    if (listening) return;
    listening = true;
    const wake = () => {
      if (!enabled || context?.state === 'running') return;
      sound.unlock();
    };
    for (const type of ['pointerdown', 'touchend', 'click'] as const) {
      document.addEventListener(type, wake, { capture: true, passive: true });
    }
  },
  beep(kind: BeepKind) {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      // Hors geste, resume() peut échouer : ce bip est perdu, le prochain tap réveillera l'audio.
      void ctx.resume().catch(() => undefined);
      return;
    }
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
