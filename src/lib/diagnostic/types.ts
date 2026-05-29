// Types du diagnostic de maturité OSKAR (porté de docs/inspiration/bilan.html)

/** Identifiants des 5 piliers OSKAR */
export type PillarId = 'vision' | 'fit' | 'finance' | 'okr' | 'team';

/** Niveau de maturité d'un score : f=Fragile, c=En construction, s=Solide */
export type StateKey = 'f' | 'c' | 's';

/** Définition d'un pilier : métadonnées, couleur d'accent et 3 critères objectifs */
export interface Pillar {
  id: PillarId;
  label: string;
  module: string;
  color: string;
  desc: string;
  q: [string, string, string];
}

/** Message de recommandation par pilier et par niveau de maturité */
export interface PillarAdvice {
  prio: string;
  detail: string;
  /** Cible du module recommandé (route interne) ou null si aucun */
  module: string | null;
}

/** Carte des conseils pour les 3 niveaux d'un pilier */
export type PillarAdviceMap = Record<StateKey, PillarAdvice>;

/** Règle croisée entre deux piliers à un niveau de maturité donné */
export interface CrossRule {
  a: PillarId;
  sa: StateKey;
  b: PillarId;
  sb: StateKey;
  t1: string;
  t2: string;
}

/** État de saisie d'un pilier dans le formulaire */
export interface PillarInput {
  /** Valeur du curseur « ressenti » (0–10) */
  slider: number;
  /** Cases des 3 critères objectifs */
  checks: [boolean, boolean, boolean];
  /** Le pilier a-t-il été touché (slider bougé ou case cochée) ? */
  touched: boolean;
}

/** État complet du formulaire, indexé par pilier */
export type DiagnosticState = Record<PillarId, PillarInput>;

/** Couleurs d'un badge de niveau (fond + texte) */
export interface StateColor {
  bg: string;
  c: string;
}

/** Ligne de récap d'un pilier dans la synthèse */
export interface ScoreRecap {
  id: PillarId;
  label: string;
  score: number;
  state: StateKey;
}

/** Axe prioritaire (pilier fragile ou en construction) */
export interface PriorityItem {
  id: PillarId;
  label: string;
  score: number;
  state: StateKey;
  prio: string;
  detail: string;
}

/** Point d'appui (pilier solide) */
export interface SupportItem {
  id: PillarId;
  label: string;
  score: number;
  detail: string;
}

/** Insight croisé entre deux piliers évalués */
export interface CrossInsight extends CrossRule {
  labelA: string;
  labelB: string;
}

/** Recommandation de module finale */
export interface ModuleReco {
  kind: 'module' | 'congrats';
  title: string;
  text: string;
  module?: string | null;
}

/** Résultat structuré complet de l'analyse */
export interface AnalysisResult {
  evaluatedCount: number;
  average: number;
  averageState: StateKey;
  globalMessage: string;
  recap: ScoreRecap[];
  priorities: PriorityItem[];
  supports: SupportItem[];
  insights: CrossInsight[];
  reco: ModuleReco | null;
}
