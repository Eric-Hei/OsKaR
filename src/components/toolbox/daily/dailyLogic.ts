/** Logique pure du Daily Stand-up (tour de table minuté). */

export type DailyPhase = 'idle' | 'next' | 'running' | 'paused' | 'done';

export interface DailyState {
  phase: DailyPhase;
  /** Ordre de passage : identifiants de participants. */
  order: string[];
  /** Index courant dans `order` (-1 hors session). */
  currentIdx: number;
  /** Temps de parole par personne, en secondes. */
  durationSec: number;
  /** Horodatage (ms) de fin du tour courant quand `running`. */
  endsAt: number | null;
  /** Temps restant figé (pause / avant départ), en secondes. */
  remainingSec: number;
  /** Horodatage (ms) de début de séance, pour la durée totale. */
  startedAt: number | null;
}

export const DAILY_DURATIONS = [
  { value: 60, label: '1 min' },
  { value: 90, label: '1 min 30' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];

export const INITIAL_DAILY_STATE: DailyState = {
  phase: 'idle',
  order: [],
  currentIdx: -1,
  durationSec: 120,
  endsAt: null,
  remainingSec: 120,
  startedAt: null,
};

/** Temps restant du tour courant (négatif = dépassement). */
export function turnRemaining(state: DailyState, now: number = Date.now()): number {
  if (state.phase === 'running' && state.endsAt) {
    return Math.ceil((state.endsAt - now) / 1000);
  }
  return state.remainingSec;
}

/** Formate un nombre de secondes en MM:SS (préfixe « + » en dépassement). */
export function formatTime(s: number): string {
  const abs = Math.abs(s);
  const m = Math.floor(abs / 60).toString().padStart(2, '0');
  const sec = (abs % 60).toString().padStart(2, '0');
  return (s < 0 ? '+' : '') + m + ':' + sec;
}
