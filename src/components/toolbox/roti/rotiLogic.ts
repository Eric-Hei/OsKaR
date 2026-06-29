/** Logique pure du ROTI (Return On Time Invested). */

export interface RotiVote {
  star: number; // 1..5
  comment: string;
}

export interface RotiState {
  /** Intitulé de la séance évaluée. */
  session: string;
  /** Votes par identifiant participant. */
  votes: Record<string, RotiVote>;
  revealed: boolean;
}

export const INITIAL_ROTI_STATE: RotiState = {
  session: '',
  votes: {},
  revealed: false,
};

export const STAR_LABELS = ['', 'Perte de temps', 'Peu utile', 'Correct', 'Utile', 'Indispensable'];
export const STAR_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981'];

interface Verdict {
  min: number;
  label: string;
  bg: string;
  color: string;
}

export const VERDICTS: Verdict[] = [
  { min: 0, label: 'En attente…', bg: '#f1f5f9', color: '#64748b' },
  { min: 1, label: 'À améliorer 😬', bg: '#fee2e2', color: '#b91c1c' },
  { min: 2, label: 'Perfectible 🤔', bg: '#ffedd5', color: '#c2410c' },
  { min: 3, label: 'Correct 👍', bg: '#fef9c3', color: '#a16207' },
  { min: 4, label: 'Très bien ! 🎉', bg: '#dcfce7', color: '#15803d' },
  { min: 4.6, label: 'Excellent ! 🔥', bg: '#d1fae5', color: '#047857' },
];

export interface RotiResults {
  count: number;
  avg: number;
  avgRounded: number;
  /** Indice de couleur/étoile (1..5) basé sur l'arrondi de la moyenne. */
  starIndex: number;
  verdict: Verdict;
  distribution: { star: number; count: number; pct: number }[];
}

/** Calcule moyenne, verdict et distribution à partir des votes. */
export function computeRoti(votes: Record<string, RotiVote>): RotiResults {
  const values = Object.values(votes).map((v) => v.star).filter((s) => s >= 1 && s <= 5);
  const count = values.length;
  const avg = count > 0 ? values.reduce((s, x) => s + x, 0) / count : 0;
  const avgRounded = Math.round(avg * 10) / 10;
  const starIndex = Math.min(5, Math.max(0, Math.round(avg)));
  const verdict =
    [...VERDICTS].reverse().find((v) => avgRounded >= v.min) ?? VERDICTS[0];

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const c = values.filter((s) => s === star).length;
    return { star, count: c, pct: count ? Math.round((c / count) * 100) : 0 };
  });

  return { count, avg, avgRounded, starIndex, verdict, distribution };
}
