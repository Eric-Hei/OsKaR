/** Logique pure du Team Mood (baromètre d'équipe sur 5 dimensions). */

export type MoodDimKey = 'energie' | 'charge' | 'sens' | 'liens' | 'epanouissement';

export interface MoodDimension {
  key: MoodDimKey;
  label: string;
  sub: string;
  color: string;
}

export const MOOD_DIMS: MoodDimension[] = [
  { key: 'energie', label: 'Énergie', sub: 'Est-ce que je me sens en forme ?', color: '#f59e0b' },
  { key: 'charge', label: 'Charge', sub: 'Ma charge est-elle soutenable ?', color: '#6366f1' },
  { key: 'sens', label: 'Sens', sub: 'Ce que je fais a du sens pour moi', color: '#0ea5e9' },
  { key: 'liens', label: 'Liens', sub: 'Je me sens bien dans l\'équipe', color: '#ec4899' },
  { key: 'epanouissement', label: 'Épanouissement', sub: 'Je progresse et j\'apprends', color: '#22c55e' },
];

export type MoodScores = Record<MoodDimKey, number>;

export interface MoodVote {
  dims: MoodScores;
}

export interface MoodState {
  votes: Record<string, MoodVote>;
  revealed: boolean;
}

export const INITIAL_MOOD_SCORES: MoodScores = {
  energie: 5, charge: 5, sens: 5, liens: 5, epanouissement: 5,
};

export const INITIAL_MOOD_STATE: MoodState = {
  votes: {},
  revealed: false,
};

export interface MoodRadarPoint {
  key: MoodDimKey;
  label: string;
  average: number;
}

/** Moyenne par dimension à partir des votes (0 si aucun vote). */
export function computeMoodAverages(votes: Record<string, MoodVote>): MoodRadarPoint[] {
  const voters = Object.values(votes);
  return MOOD_DIMS.map((d) => {
    const avg = voters.length
      ? Math.round((voters.reduce((s, v) => s + (v.dims[d.key] ?? 0), 0) / voters.length) * 10) / 10
      : 0;
    return { key: d.key, label: d.label, average: avg };
  });
}

/** Moyenne globale toutes dimensions confondues (sur 10). */
export function computeMoodGlobal(points: MoodRadarPoint[]): number {
  if (points.length === 0) return 0;
  return Math.round((points.reduce((s, p) => s + p.average, 0) / points.length) * 10) / 10;
}
