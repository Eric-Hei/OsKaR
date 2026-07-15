import type { BoardNote } from '@/components/toolbox/shared/boardNotes';
import { initialChrono, type ToolChrono } from '@/components/toolbox/shared/toolChrono';

/** Logique pure du Brainstorming (canvas libre de post-its). */

/** Accent vert de l'outil (cohérent avec sa bannière). */
export const BRAINSTORM_ACCENT = '#0d9466';

/** Durée par défaut du minuteur (10 minutes). */
export const BRAINSTORM_DEFAULT_DURATION_SEC = 10 * 60;

export type BrainstormColorKey = 'cy' | 'cb' | 'cg' | 'cp' | 'co' | 'cv';

export interface BrainstormColor {
  key: BrainstormColorKey;
  label: string;
  /** Fond du post-it. */
  bg: string;
  /** Pastille du sélecteur / liseré haut du post-it. */
  dot: string;
}

/** Palette des 6 couleurs de post-it (comme la maquette). */
export const BRAINSTORM_COLORS: BrainstormColor[] = [
  { key: 'cy', label: 'Jaune', bg: '#fff9c4', dot: '#f5e35a' },
  { key: 'cb', label: 'Bleu', bg: '#dbeafe', dot: '#93c5fd' },
  { key: 'cg', label: 'Vert', bg: '#dcfce7', dot: '#86efac' },
  { key: 'cp', label: 'Rose', bg: '#fce7f3', dot: '#f9a8d4' },
  { key: 'co', label: 'Orange', bg: '#ffedd5', dot: '#fdba74' },
  { key: 'cv', label: 'Violet', bg: '#ede9fe', dot: '#c4b5fd' },
];

export function getBrainstormColor(key: string): BrainstormColor {
  return BRAINSTORM_COLORS.find((c) => c.key === key) ?? BRAINSTORM_COLORS[0];
}

/** Position d'un post-it sur le canvas : fractions (0–1) + rotation en degrés. */
export interface PostitPosition {
  x: number;
  y: number;
  rot: number;
}

export interface BrainstormState {
  /** Le champ `category` de chaque note stocke la clé de couleur du post-it. */
  notes: BoardNote[];
  /** Positions des post-its révélés, indexées par id de note. */
  positions: Record<string, PostitPosition>;
  /** Thème de la session, partagé entre participants. */
  theme: string;
  chrono: ToolChrono;
}

export const INITIAL_BRAINSTORM_STATE: BrainstormState = {
  notes: [],
  positions: {},
  theme: '',
  chrono: initialChrono(BRAINSTORM_DEFAULT_DURATION_SEC),
};

/** Position aléatoire sur le canvas (marges pour une carte ~180px) + rotation −3° à +3°. */
export function randomCanvasPosition(): PostitPosition {
  const x = 0.03 + Math.random() * 0.75;
  const y = 0.1 + Math.random() * 0.68;
  const rot = Math.round((Math.random() - 0.5) * 60) / 10;
  return { x, y, rot };
}

/** Résumé texte de la séance (export .txt). */
export function buildBrainstormSummary(state: BrainstormState): string {
  const date = new Date().toLocaleDateString('fr-FR');
  let txt = `BRAINSTORMING OSKAR — ${date}\n${'='.repeat(44)}\n`;
  if (state.theme.trim()) txt += `Thème : ${state.theme.trim()}\n`;
  txt += '\n';
  const revealed = state.notes
    .filter((n) => n.revealed && n.text.trim())
    .sort((a, b) => b.likedBy.length - a.likedBy.length);
  txt += `IDÉES\n${'-'.repeat(28)}\n`;
  if (revealed.length === 0) txt += '(aucune idée)\n';
  revealed.forEach((n) => {
    const v = n.likedBy.length;
    txt += `- ${n.text.trim()}  (${v} vote${v > 1 ? 's' : ''} — ${n.authorName})\n`;
  });
  return txt;
}
