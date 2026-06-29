import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import { Eye } from 'lucide-react';
import type { ToolParticipant } from '@/hooks/useToolSession';
import { MOOD_DIMS, type MoodRadarPoint, type MoodState } from './moodLogic';

interface MoodRadarProps {
  radarData: MoodRadarPoint[];
  globalAvg: number;
  state: MoodState;
  participants: ToolParticipant[];
}

/** Panneau de résultats Team Mood : radar de la moyenne + notes individuelles. */
export const MoodRadar: React.FC<MoodRadarProps> = ({ radarData, globalAvg, state, participants }) => {
  if (!state.revealed) {
    const voted = Object.keys(state.votes).length;
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-sm text-muted">
        <Eye className="mb-3 h-10 w-10 opacity-20" aria-hidden />
        Les notes sont masquées jusqu'à la révélation.
        <div className="mt-2 font-semibold text-navy">
          {voted} / {participants.length} ont voté
        </div>
      </div>
    );
  }

  const chartData = radarData.map((p) => ({ label: p.label, average: p.average }));
  const voters = participants.filter((p) => state.votes[p.id]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6" aria-live="polite">
      <div className="text-center">
        <div className="text-4xl font-black text-navy">{globalAvg}<span className="text-lg text-muted"> / 10</span></div>
        <div className="text-sm font-medium text-muted">Moral global de l'équipe</div>
      </div>

      <div className="mx-auto mt-4 h-[320px] w-full max-w-md" role="img" aria-label="Radar de la moyenne d'équipe par dimension">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="label" tick={{ fill: '#1e2d7d', fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis domain={[0, 10]} tickCount={6} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar dataKey="average" stroke="#00d4b4" fill="#00d4b4" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Notes individuelles</div>
        <ul className="flex flex-col gap-2.5">
          {voters.map((p) => {
            const v = state.votes[p.id];
            return (
              <li key={p.id} className="rounded-xl border border-line bg-white p-3 shadow-card">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: p.color }}
                    aria-hidden
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-navy">{p.name}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {MOOD_DIMS.map((d) => (
                    <span
                      key={d.key}
                      className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-semibold text-navy"
                      title={d.label}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: d.color }} aria-hidden />
                      {d.label.slice(0, 3)} {v.dims[d.key]}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MoodRadar;
