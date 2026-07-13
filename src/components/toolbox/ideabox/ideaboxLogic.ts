import type { BoardNote } from '@/components/toolbox/shared/boardNotes';

/** Logique pure de la Boîte à idées (soumission, votes cœurs, sélection). */

/** Accent ambre de l'outil (cohérent avec sa bannière). */
export const IDEABOX_ACCENT = '#b45309';

export type IdeaCategoryKey = 'process' | 'tools' | 'team' | 'client' | 'other';

export interface IdeaCategory {
  key: IdeaCategoryKey;
  label: string;
  color: string;
}

/** Catégories d'idée proposées dans le composeur et les filtres. */
export const IDEA_CATEGORIES: IdeaCategory[] = [
  { key: 'process', label: 'Processus', color: '#6366f1' },
  { key: 'tools', label: 'Outils', color: '#0ea5e9' },
  { key: 'team', label: 'Équipe', color: '#ec4899' },
  { key: 'client', label: 'Client', color: '#22c55e' },
  { key: 'other', label: 'Autre', color: '#94a3b8' },
];

export function getIdeaCategory(key: string): IdeaCategory {
  return IDEA_CATEGORIES.find((c) => c.key === key) ?? IDEA_CATEGORIES[0];
}

export interface IdeaboxState {
  /** Idées dans l'ordre de soumission (la plus ancienne en premier). */
  notes: BoardNote[];
}

export const INITIAL_IDEABOX_STATE: IdeaboxState = {
  notes: [],
};

export type IdeaSort = 'votes' | 'date';

/**
 * Trie les idées : « votes » = votes décroissants puis récence ;
 * « date » = récence seule (les plus récentes d'abord).
 */
export function sortIdeas(notes: BoardNote[], sort: IdeaSort): BoardNote[] {
  const byRecency = [...notes].reverse();
  if (sort === 'date') return byRecency;
  return byRecency.sort((a, b) => b.likedBy.length - a.likedBy.length);
}

/** Résumé texte de la séance (export .txt). */
export function buildIdeaboxSummary(state: IdeaboxState): string {
  const date = new Date().toLocaleDateString('fr-FR');
  const published = state.notes.filter((n) => n.revealed);
  const retained = sortIdeas(published.filter((n) => n.retained), 'votes');
  const others = sortIdeas(published.filter((n) => !n.retained), 'votes');
  const totalVotes = published.reduce((sum, n) => sum + n.likedBy.length, 0);

  const line = (n: BoardNote) => {
    const v = n.likedBy.length;
    return `- [${getIdeaCategory(n.category).label}] ${n.text.trim()}  (${v} vote${v > 1 ? 's' : ''} — ${n.authorName})\n`;
  };

  let txt = `BOÎTE À IDÉES OSKAR — ${date}\n${'='.repeat(44)}\n\n`;
  txt += `Idées publiées : ${published.length}\n`;
  txt += `Votes exprimés : ${totalVotes}\n`;
  txt += `Idées retenues : ${retained.length}\n\n`;

  txt += `IDÉES RETENUES\n${'-'.repeat(40)}\n`;
  if (retained.length === 0) txt += '(aucune idée retenue)\n';
  retained.forEach((n) => { txt += line(n); });
  txt += '\n';

  txt += `AUTRES IDÉES PUBLIÉES\n${'-'.repeat(40)}\n`;
  if (others.length === 0) txt += '(aucune idée)\n';
  others.forEach((n) => { txt += line(n); });

  return txt;
}
