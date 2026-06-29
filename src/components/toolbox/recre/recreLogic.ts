/** Logique pure de l'outil « En mode récré ! » (rétro photos partagées). */

/** Accent rose de l'outil (cohérent avec sa bannière et les « j'aime »). */
export const RECRE_ACCENT = '#ec4899';

export type RecrePhase = 'deposit' | 'reveal';

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

export interface RecreState {
  phase: RecrePhase;
  /** Thème / consigne de la séance (saisi par l'animateur). */
  theme: string;
  photos: RecrePhoto[];
  /** Ordre (mélangé) des photos en mode révélation. */
  revealOrder: string[];
  /** Index courant dans `revealOrder`. */
  revealIdx: number;
  /** L'auteur de la photo courante est-il dévoilé ? */
  authorShown: boolean;
}

export const INITIAL_RECRE_STATE: RecreState = {
  phase: 'deposit',
  theme: '',
  photos: [],
  revealOrder: [],
  revealIdx: 0,
  authorShown: false,
};

/** Mélange (Fisher–Yates) une copie du tableau. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Légère inclinaison déterministe d'une photo (effet « polaroid »). */
export function tiltFor(index: number): number {
  const tilts = [-3.5, 2.5, -1.5, 3, -2.5, 1.5, -3, 2];
  return tilts[index % tilts.length];
}

/** Retrouve une photo par son identifiant. */
export function findPhoto(state: RecreState, id: string | undefined): RecrePhoto | undefined {
  if (!id) return undefined;
  return state.photos.find((p) => p.id === id);
}
