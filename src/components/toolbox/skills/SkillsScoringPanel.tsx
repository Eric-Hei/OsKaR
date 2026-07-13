import React from 'react';
import { UserRound } from 'lucide-react';
import {
  countScored, type Skill, type SkillsPerson,
} from './skillsLogic';

interface SkillsScoringPanelProps {
  me: SkillsPerson | null;
  skills: Skill[];
  onSetScore: (skillId: string, value: number) => void;
}

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Panneau d'auto-évaluation : chaque participant se note de 1 à 10 sur
 * chacune des compétences listées. Chacun ne note que sa propre fiche.
 */
export const SkillsScoringPanel: React.FC<SkillsScoringPanelProps> = ({ me, skills, onSetScore }) => {
  if (!me) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-muted">
        <UserRound className="mb-3 h-10 w-10 opacity-20" aria-hidden />
        Connexion à la session…
      </div>
    );
  }

  const done = countScored(me, skills);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-line">
      <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: me.color }} aria-hidden />
        <span className="text-sm font-bold text-navy">Mon auto-évaluation</span>
        <span className="ml-auto text-xs font-semibold text-muted" aria-live="polite">
          {done} / {skills.length} notées
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {skills.map((s) => {
          const val = me.scores[s.id] ?? 0;
          return (
            <div key={s.id} className="rounded-xl border border-line bg-white p-3 shadow-card">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-navy">{s.name}</span>
                <span className="text-sm font-black" style={{ color: val > 0 ? me.color : '#cbd5e1' }}>
                  {val > 0 ? `${val}/10` : '—'}
                </span>
              </div>
              <div
                className="grid grid-cols-10 gap-1"
                role="radiogroup"
                aria-label={`Ma note pour ${s.name}`}
              >
                {SCALE.map((n) => {
                  const sel = val === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      aria-label={`${n} sur 10`}
                      onClick={() => onSetScore(s.id, n)}
                      className={`h-8 rounded-md border text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                        sel ? 'text-white' : 'border-line bg-surface text-muted hover:border-muted/50 hover:text-navy'
                      }`}
                      style={sel ? { background: me.color, borderColor: me.color } : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsScoringPanel;
