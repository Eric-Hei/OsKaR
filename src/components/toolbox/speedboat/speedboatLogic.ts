import type { BoardNote } from '@/components/toolbox/shared/boardNotes';

/** Logique pure de la Rétrospective Speedboat (voilier vers l'île au trésor). */

/** Accent de l'outil (cohérent avec sa bannière). */
export const SPEEDBOAT_ACCENT = '#0369a1';

export type SpeedboatZoneKey = 'vent' | 'objectif' | 'ancre' | 'recif';

export interface SpeedboatZone {
  key: SpeedboatZoneKey;
  name: string;
  color: string;
  desc: string;
  placeholder: string;
  /** Position de la zone sur la scène, en % du conteneur. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Coin d'ancrage du libellé de zone. */
  labelCorner: 'tl' | 'tr' | 'bl' | 'br';
}

/** Zones calibrées sur l'image de fond (voilier au centre, laissé libre). */
export const SPEEDBOAT_ZONES: SpeedboatZone[] = [
  {
    key: 'vent', name: 'Le Vent', color: '#0ea5e9',
    desc: "Ce qui nous a aidés à avancer — nos forces, accélérateurs et tout ce qui a favorisé l'élan de l'équipe.",
    placeholder: 'Ce qui nous a aidés à avancer…',
    left: 0, top: 0, width: 50, height: 50, labelCorner: 'tl',
  },
  {
    key: 'objectif', name: "L'Île au trésor", color: '#00d4b4',
    desc: "Nos succès et fiertés — ce que l'équipe a accompli et dont elle est fière.",
    placeholder: 'Un succès, quelque chose dont on est fiers…',
    left: 50, top: 0, width: 50, height: 50, labelCorner: 'tr',
  },
  {
    key: 'ancre', name: 'Les Ancres', color: '#6366f1',
    desc: 'Ce qui nous ralentit ou nous retient — blocages, dettes, friction qui freinent l\'équipe.',
    placeholder: 'Ce qui nous ralentit ou nous retient…',
    left: 0, top: 50, width: 50, height: 50, labelCorner: 'bl',
  },
  {
    key: 'recif', name: 'Le Récif', color: '#ec4899',
    desc: "Les obstacles et problèmes rencontrés — ce qui a failli faire dérailler l'équipe.",
    placeholder: 'Un obstacle ou problème rencontré…',
    left: 50, top: 50, width: 50, height: 50, labelCorner: 'br',
  },
];

export function getSpeedboatZone(key: string): SpeedboatZone {
  return SPEEDBOAT_ZONES.find((z) => z.key === key) ?? SPEEDBOAT_ZONES[0];
}

/** Position d'une carte sur la scène, en fraction (0–1) du conteneur. */
export interface CardPosition {
  x: number;
  y: number;
}

export interface SpeedboatState {
  notes: BoardNote[];
  /** Positions des cartes placées, indexées par id de note. */
  positions: Record<string, CardPosition>;
}

export const INITIAL_SPEEDBOAT_STATE: SpeedboatState = {
  notes: [],
  positions: {},
};

/** Position aléatoire à l'intérieur d'une zone (avec marge pour la carte). */
export function randomPositionIn(zone: SpeedboatZone): CardPosition {
  const margin = 0.03;
  const cardW = 0.16;
  const cardH = 0.14;
  const x = zone.left / 100 + margin + Math.random() * Math.max(0, zone.width / 100 - cardW - margin * 2);
  const y = zone.top / 100 + margin + Math.random() * Math.max(0, zone.height / 100 - cardH - margin * 2);
  return { x, y };
}

/** Résumé texte de la séance (export .txt). */
export function buildSpeedboatSummary(state: SpeedboatState): string {
  const date = new Date().toLocaleDateString('fr-FR');
  const placed = state.notes.filter((n) => n.revealed);
  let txt = `RÉTROSPECTIVE SPEEDBOAT — OSKAR — ${date}\n${'='.repeat(50)}\n\n`;
  SPEEDBOAT_ZONES.forEach((z) => {
    const pool = placed
      .filter((n) => n.category === z.key)
      .sort((a, b) => b.likedBy.length - a.likedBy.length);
    txt += `${z.name.toUpperCase()}\n${'-'.repeat(28)}\n`;
    if (pool.length === 0) txt += '  (aucune carte)\n';
    pool.forEach((n) => {
      const v = n.likedBy.length;
      txt += `${n.retained ? '[✓] ' : '    '}${n.text}  (${v} vote${v > 1 ? 's' : ''} — ${n.authorName})\n`;
    });
    txt += '\n';
  });
  return txt;
}
