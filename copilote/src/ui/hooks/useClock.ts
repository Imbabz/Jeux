import { useEffect, useRef, useState } from 'react';

/**
 * Horloge pausable : renvoie le temps écoulé (ms) tant que `running` est vrai.
 * Les composants qui l'utilisent sont remontés (`key`) à chaque nouvel état : l'horloge repart de 0.
 */
export function useClock(running: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  const accumulated = useRef(0);
  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    const tick = () => setElapsed(accumulated.current + performance.now() - startedAt);
    const id = window.setInterval(tick, 50);
    return () => {
      window.clearInterval(id);
      accumulated.current += performance.now() - startedAt;
    };
  }, [running]);
  return elapsed;
}

export interface TimelineStep {
  readonly at: number;
  readonly run: () => void;
}

/** Déclenche chaque étape une seule fois quand l'horloge atteint son instant. */
export function useTimeline(running: boolean, steps: readonly TimelineStep[]): number {
  const elapsed = useClock(running);
  const fired = useRef(0);
  useEffect(() => {
    while (fired.current < steps.length && elapsed >= (steps[fired.current] as TimelineStep).at) {
      (steps[fired.current] as TimelineStep).run();
      fired.current += 1;
    }
  }, [elapsed, steps]);
  return elapsed;
}
