import type { BoardNote } from '@/components/toolbox/shared/boardNotes';

/** Logique pure de « Disons-nous les choses » (deux colonnes Freins / Moteurs). */

/** Accent rouge de l'outil (cohérent avec sa bannière). */
export const DISONS_ACCENT = '#be123c';

export type DisonsKind = 'frein' | 'moteur';

export interface DisonsKindInfo {
  key: DisonsKind;
  label: string;
  /** Titre de la colonne sur le tableau partagé. */
  columnTitle: string;
  color: string;
  /** Fond pastel de la colonne. */
  bg: string;
  placeholder: string;
}

/** Les deux types de carte dans l'ordre d'affichage des colonnes. */
export const DISONS_KINDS: DisonsKindInfo[] = [
  {
    key: 'frein', label: 'Frein', columnTitle: 'Ce qui nous freine',
    color: '#e11d48', bg: '#fff1f2',
    placeholder: "Décris ce qui freine l'équipe…",
  },
  {
    key: 'moteur', label: 'Moteur', columnTitle: 'Ce qui nous propulse',
    color: '#16a34a', bg: '#f0fdf4',
    placeholder: "Décris ce qui propulse l'équipe…",
  },
];

export function getDisonsKind(key: string): DisonsKindInfo {
  return DISONS_KINDS.find((k) => k.key === key) ?? DISONS_KINDS[0];
}

export interface DisonsState {
  notes: BoardNote[];
}

export const INITIAL_DISONS_STATE: DisonsState = {
  notes: [],
};

/** Résumé texte de la séance (export .txt). */
export function buildDisonsSummary(state: DisonsState): string {
  const date = new Date().toLocaleDateString('fr-FR');
  const published = state.notes.filter((n) => n.revealed);
  let txt = `DISONS-NOUS LES CHOSES — OSKAR — ${date}\n${'='.repeat(48)}\n\n`;
  DISONS_KINDS.forEach((kind) => {
    const pool = published
      .filter((n) => n.category === kind.key)
      .sort((a, b) => b.likedBy.length - a.likedBy.length);
    txt += `${kind.columnTitle.toUpperCase()}\n${'-'.repeat(30)}\n`;
    if (pool.length === 0) txt += '  (aucune carte)\n';
    pool.forEach((n) => {
      const v = n.likedBy.length;
      txt += `${n.retained ? '[✓] ' : '    '}${n.text}  (${v} vote${v > 1 ? 's' : ''} — ${n.authorName})\n`;
    });
    txt += '\n';
  });
  return txt;
}
