import { generateId } from '@/utils';

/** Logique pure de « Compétences de l'équipe » (auto-évaluation 1–10 + radars). */

/** Accent bleu de l'outil (cohérent avec sa bannière). */
export const SKILLS_ACCENT = '#0369a1';

export const MIN_SKILLS = 3;
export const MAX_SKILLS = 10;
export const SKILL_NAME_MAX = 36;

/** Compétences proposées par défaut à l'ouverture d'une session. */
export const DEFAULT_SKILL_NAMES = [
  'Communication',
  'Autonomie',
  'Entraide',
  "Prise d'initiative",
  'Gestion du stress',
  'Clarté des rôles',
  'Adaptabilité',
];

export interface Skill {
  id: string;
  name: string;
}

/** Fiche d'un participant : identité figée + notes par compétence (1–10). */
export interface SkillsPerson {
  id: string;
  name: string;
  color: string;
  scores: Record<string, number>;
}

export interface SkillsState {
  skills: Skill[];
  /** Fiches par participant (persistent même si la personne se déconnecte). */
  people: Record<string, SkillsPerson>;
}

export function buildDefaultSkills(): Skill[] {
  return DEFAULT_SKILL_NAMES.map((name) => ({ id: generateId(), name }));
}

export const INITIAL_SKILLS_STATE: SkillsState = {
  skills: buildDefaultSkills(),
  people: {},
};

/** Fiches dans l'ordre d'arrivée (ordre d'insertion des clés). */
export function peopleOf(state: SkillsState): SkillsPerson[] {
  return Object.values(state.people);
}

/** Nombre de compétences notées par une fiche (parmi celles encore listées). */
export function countScored(person: SkillsPerson, skills: Skill[]): number {
  return skills.filter((s) => (person.scores[s.id] ?? 0) > 0).length;
}

/** Vrai si la fiche a noté toutes les compétences listées. */
export function isComplete(person: SkillsPerson, skills: Skill[]): boolean {
  return skills.length > 0 && countScored(person, skills) === skills.length;
}

/** Moyenne d'équipe pour une compétence (0 si personne ne l'a notée). */
export function skillAverage(state: SkillsState, skillId: string): number {
  const vals = peopleOf(state)
    .map((p) => p.scores[skillId] ?? 0)
    .filter((v) => v > 0);
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export interface SkillsRadarPoint {
  label: string;
  value: number;
}

/** Points radar d'une fiche individuelle (0 pour les compétences non notées). */
export function personRadarData(person: SkillsPerson, skills: Skill[]): SkillsRadarPoint[] {
  return skills.map((s) => ({ label: s.name, value: person.scores[s.id] ?? 0 }));
}

/** Points radar de la moyenne d'équipe. */
export function teamRadarData(state: SkillsState): SkillsRadarPoint[] {
  return state.skills.map((s) => ({ label: s.name, value: skillAverage(state, s.id) }));
}

/** Couleur sémantique d'un score (vert ≥ 8, ambre ≥ 5, rouge sinon). */
export function scoreColor(val: number): string {
  if (val >= 8) return '#22c55e';
  if (val >= 5) return '#f59e0b';
  return '#ef4444';
}

/** Résumé texte de la séance (export .txt). */
export function buildSkillsSummary(state: SkillsState): string {
  const date = new Date().toLocaleDateString('fr-FR');
  const people = peopleOf(state);

  let txt = `COMPÉTENCES DE L'ÉQUIPE — OSKAR — ${date}\n${'='.repeat(48)}\n\n`;
  txt += `Participants : ${people.length}\n`;
  txt += `Compétences : ${state.skills.length}\n`;
  txt += `Fiches complètes : ${people.filter((p) => isComplete(p, state.skills)).length}\n\n`;

  state.skills.forEach((s) => {
    txt += `${s.name.toUpperCase()}\n`;
    people.forEach((p) => {
      const v = p.scores[s.id];
      txt += `  ${p.name.padEnd(16)} ${v ? `${v}/10` : '—'}\n`;
    });
    const avg = skillAverage(state, s.id);
    if (avg > 0) txt += `  ${'Moyenne'.padEnd(16)} ${avg}/10\n`;
    txt += '\n';
  });

  return txt;
}
