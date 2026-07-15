import type { BoardNote } from '@/components/toolbox/shared/boardNotes';
import { initialChrono, type ToolChrono } from '@/components/toolbox/shared/toolChrono';

/** Logique pure de la Rétrospective d'équipe (tableau 4 quadrants). */

/** Accent vert de l'outil (cohérent avec sa bannière). */
export const RETRO_ACCENT = '#047857';

/** Durée par défaut du minuteur (10 minutes). */
export const RETRO_DEFAULT_DURATION_SEC = 10 * 60;

export type RetroCategoryKey = 'plus' | 'start' | 'minus' | 'question';

export interface RetroCategory {
  key: RetroCategoryKey;
  label: string;
  /** Symbole court du quadrant (+, ★, –, ?). */
  symbol: string;
  color: string;
  /** Fond pastel du quadrant. */
  bg: string;
  placeholder: string;
}

/** Quadrants dans l'ordre d'affichage du board (2 × 2). */
export const RETRO_CATEGORIES: RetroCategory[] = [
  {
    key: 'plus', label: 'Ça a bien fonctionné', symbol: '+', color: '#10b981', bg: '#ecfdf5',
    placeholder: 'Un point positif à partager…',
  },
  {
    key: 'start', label: 'À démarrer', symbol: '★', color: '#6366f1', bg: '#eef2ff',
    placeholder: 'Une idée, une action à lancer…',
  },
  {
    key: 'minus', label: 'Ça a moins bien marché', symbol: '–', color: '#f43f5e', bg: '#fff1f2',
    placeholder: 'Un point de friction, une difficulté…',
  },
  {
    key: 'question', label: 'Questions ouvertes', symbol: '?', color: '#f59e0b', bg: '#fffbeb',
    placeholder: 'Une question à poser à l\'équipe…',
  },
];

export function getRetroCategory(key: string): RetroCategory {
  return RETRO_CATEGORIES.find((c) => c.key === key) ?? RETRO_CATEGORIES[0];
}

/** Champs éditables d'une action issue d'une note « À démarrer ». */
export interface RetroActionMeta {
  resp: string;
  deadline: string;
  done: boolean;
}

export interface RetroState {
  notes: BoardNote[];
  /** Métadonnées d'action, indexées par id de note (quadrant « À démarrer »). */
  actionMeta: Record<string, RetroActionMeta>;
  chrono: ToolChrono;
}

export const INITIAL_RETRO_STATE: RetroState = {
  notes: [],
  actionMeta: {},
  chrono: initialChrono(RETRO_DEFAULT_DURATION_SEC),
};

/** Notes révélées du quadrant « À démarrer » = actions de la rétro. */
export function retroActions(state: RetroState): BoardNote[] {
  return state.notes.filter((n) => n.revealed && n.category === 'start');
}

/** Résumé texte de la séance (export .txt). */
export function buildRetroSummary(state: RetroState): string {
  const date = new Date().toLocaleDateString('fr-FR');
  let txt = `RÉTROSPECTIVE OSKAR — ${date}\n${'='.repeat(44)}\n\n`;
  RETRO_CATEGORIES.forEach((cat) => {
    txt += `${cat.symbol} ${cat.label}\n${'-'.repeat(40)}\n`;
    const notes = state.notes.filter((n) => n.revealed && n.category === cat.key && n.text.trim());
    if (notes.length === 0) {
      txt += '(aucune note)\n';
    } else {
      notes.forEach((n) => { txt += `- [${n.authorName}] ${n.text.trim()}\n`; });
    }
    txt += '\n';
  });
  txt += `\nACTIONS\n${'='.repeat(44)}\n`;
  retroActions(state).forEach((n) => {
    const meta = state.actionMeta[n.id];
    txt += `- [${n.authorName}] ${n.text.trim()}`
      + `${meta?.resp ? ` → ${meta.resp}` : ''}`
      + `${meta?.deadline ? ` | ${meta.deadline}` : ''}`
      + `${meta?.done ? ' (fait)' : ''}\n`;
  });
  return txt;
}
