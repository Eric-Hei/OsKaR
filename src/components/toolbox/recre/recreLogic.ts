/** Logique pure de l'outil « En mode récré ! » (rétro photos partagées). */

/** Accent rose de l'outil (cohérent avec sa bannière et les « j'aime »). */
export const RECRE_ACCENT = '#ec4899';

/** Durée par défaut du minuteur de dépôt des photos (5 minutes). */
export const RECRE_DEFAULT_DURATION_SEC = 5 * 60;

export interface RecrePhoto {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  /** URL publique (Storage) ou data URL (repli mode dégradé). */
  url: string;
  /** Identifiants des participants ayant aimé la photo. */
  likedBy: string[];
}

/** Minuteur partagé (mêmes mécaniques que le Planning Poker). */
export interface RecreChrono {
  running: boolean;
  /** Timestamp (ms) de fin quand le chrono tourne, sinon null. */
  endsAt: number | null;
  /** Secondes restantes quand le chrono est en pause / à l'arrêt. */
  remainingSec: number;
  /** Durée configurée (secondes) pour un reset. */
  durationSec: number;
}

export interface RecreState {
  /** Thème / consigne de la séance (saisi par l'animateur). */
  theme: string;
  photos: RecrePhoto[];
  chrono: RecreChrono;
}

export const INITIAL_RECRE_STATE: RecreState = {
  theme: '',
  photos: [],
  chrono: {
    running: false,
    endsAt: null,
    remainingSec: RECRE_DEFAULT_DURATION_SEC,
    durationSec: RECRE_DEFAULT_DURATION_SEC,
  },
};

/** Légère inclinaison déterministe d'une photo (effet « polaroid »). */
export function tiltFor(index: number): number {
  const tilts = [-3.5, 2.5, -1.5, 3, -2.5, 1.5, -3, 2];
  return tilts[index % tilts.length];
}

/** Secondes restantes effectives selon l'état du chrono. */
export function chronoRemaining(chrono: RecreChrono, now: number = Date.now()): number {
  if (chrono.running && chrono.endsAt) {
    return Math.max(0, Math.round((chrono.endsAt - now) / 1000));
  }
  return chrono.remainingSec;
}

/** Format mm:ss. */
export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
