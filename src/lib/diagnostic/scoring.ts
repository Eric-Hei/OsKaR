import type {
  AnalysisResult,
  CrossInsight,
  DiagnosticState,
  PillarId,
  PillarInput,
  PriorityItem,
  ScoreRecap,
  StateColor,
  StateKey,
  SupportItem,
} from './types';
import { PILLARS, PILLAR_SHORT_LABEL, AN_PILIER } from './pillars';
import { AN_RULES } from './rules';

/** État initial du formulaire : slider à 5, aucune case cochée, non touché */
export function createInitialState(): DiagnosticState {
  return PILLARS.reduce((acc, p) => {
    acc[p.id] = { slider: 5, checks: [false, false, false], touched: false };
    return acc;
  }, {} as DiagnosticState);
}

/** Part objective du score : (cases cochées / 3) × 6 */
export function objectiveScore(input: PillarInput): number {
  const n = input.checks.filter(Boolean).length;
  return (n / 3) * 6;
}

/** Part subjective du score : (ressenti / 10) × 4 */
export function subjectiveScore(input: PillarInput): number {
  return (input.slider / 10) * 4;
}

/** Score hybride d'un pilier (0–10), arrondi à 1 décimale */
export function score(input: PillarInput): number {
  return Math.round((objectiveScore(input) + subjectiveScore(input)) * 10) / 10;
}

/** Formate un score « 7,5 » (virgule décimale française) */
export function fmt(v: number): string {
  return v.toFixed(1).replace('.', ',');
}

/** Niveau de maturité d'un score : f (≤4), c (≤7), s (sinon) */
export function stateOf(s: number): StateKey {
  return s <= 4 ? 'f' : s <= 7 ? 'c' : 's';
}

/** Libellé d'un niveau de maturité */
export function stateLabel(s: StateKey): string {
  return s === 'f' ? 'Fragile' : s === 'c' ? 'En construction' : 'Solide';
}

/** Couleurs (fond + texte) d'un badge de niveau */
export function stateColor(s: StateKey): StateColor {
  if (s === 'f') return { bg: '#fee2e2', c: '#dc2626' };
  if (s === 'c') return { bg: '#fef3c7', c: '#92400e' };
  return { bg: '#d1fae5', c: '#065f46' };
}

/** Couleur de bordure d'un insight selon le niveau */
export function stateBorder(s: StateKey): string {
  return s === 'f' ? '#ef4444' : s === 'c' ? '#f59e0b' : '#10b981';
}

const GLOBAL_MESSAGE: Record<StateKey, string> = {
  s: "Votre organisation affiche un niveau de maturité solide sur l'ensemble des piliers évalués. C'est une excellente base — continuez à entretenir cette dynamique !",
  c: "Votre organisation est en bonne dynamique de structuration. Plusieurs piliers progressent — l'enjeu est maintenant de consolider les fondations les plus fragiles.",
  f: "Plusieurs piliers nécessitent une attention prioritaire. Un accompagnement structuré permettrait d'accélérer la progression sur les axes les plus critiques.",
};

const PRIORITY_ORDER: Record<string, number> = { ff: 0, fc: 1, cf: 1, fs: 2, sf: 2, cc: 3, cs: 4, sc: 4, ss: 5 };

/** Construit le résultat structuré de l'analyse à partir de l'état du formulaire */
export function buildAnalysis(state: DiagnosticState): AnalysisResult | null {
  const scores: Partial<Record<PillarId, number>> = {};
  PILLARS.forEach((p) => {
    if (state[p.id].touched) scores[p.id] = score(state[p.id]);
  });
  const evaluated = Object.keys(scores) as PillarId[];
  const n = evaluated.length;
  if (!n) return null;

  const vals = evaluated.map((id) => scores[id] as number);
  const average = vals.reduce((a, b) => a + b, 0) / vals.length;
  const averageState = stateOf(average);

  const recap: ScoreRecap[] = PILLARS.filter((p) => state[p.id].touched).map((p) => {
    const s = score(state[p.id]);
    return { id: p.id, label: PILLAR_SHORT_LABEL[p.id], score: s, state: stateOf(s) };
  });

  const fragiles = evaluated.filter((id) => stateOf(scores[id] as number) === 'f').sort((a, b) => (scores[a] as number) - (scores[b] as number));
  const constructions = evaluated.filter((id) => stateOf(scores[id] as number) === 'c').sort((a, b) => (scores[a] as number) - (scores[b] as number));

  const priorities: PriorityItem[] = [...fragiles, ...constructions].map((id) => {
    const st = stateOf(scores[id] as number);
    const info = AN_PILIER[id][st];
    return { id, label: PILLAR_SHORT_LABEL[id], score: scores[id] as number, state: st, prio: info.prio, detail: info.detail };
  });

  const supports: SupportItem[] = evaluated
    .filter((id) => stateOf(scores[id] as number) === 's')
    .sort((a, b) => (scores[b] as number) - (scores[a] as number))
    .map((id) => ({ id, label: PILLAR_SHORT_LABEL[id], score: scores[id] as number, detail: AN_PILIER[id].s.detail }));

  const seen = new Set<string>();
  const matched = AN_RULES.filter((r) => {
    if (scores[r.a] === undefined || scores[r.b] === undefined) return false;
    if (stateOf(scores[r.a] as number) !== r.sa || stateOf(scores[r.b] as number) !== r.sb) return false;
    const k = [r.a, r.b].sort().join('-') + r.sa + r.sb;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((a, b) => (PRIORITY_ORDER[a.sa + a.sb] ?? 9) - (PRIORITY_ORDER[b.sa + b.sb] ?? 9));

  const insights: CrossInsight[] = matched.map((r) => ({ ...r, labelA: PILLAR_SHORT_LABEL[r.a], labelB: PILLAR_SHORT_LABEL[r.b] }));

  let reco: AnalysisResult['reco'] = null;
  const nextModule = fragiles.length ? AN_PILIER[fragiles[0]].f : constructions.length ? AN_PILIER[constructions[0]].c : null;
  if (nextModule && nextModule.module) {
    reco = { kind: 'module', title: 'Prochain module recommandé', text: 'Commencer par OSKAR Vision pour poser les fondations de votre organisation.', module: nextModule.module };
  } else if (n === 5 && averageState === 's') {
    reco = { kind: 'congrats', title: 'Félicitations 🎉', text: "Tous vos piliers sont solides. Votre organisation dispose d'excellentes fondations — continuez à entretenir cette maturité !" };
  }

  return { evaluatedCount: n, average, averageState, globalMessage: GLOBAL_MESSAGE[averageState], recap, priorities, supports, insights, reco };
}
