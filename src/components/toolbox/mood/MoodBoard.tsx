import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { ToolParticipant } from '@/hooks/useToolSession';
import { MOOD_DIMS, INITIAL_MOOD_SCORES, type MoodScores, type MoodState, type MoodVote } from './moodLogic';

interface MoodBoardProps {
  state: MoodState;
  participants: ToolParticipant[];
  myId: string;
  myVote: MoodVote | undefined;
  onVote: (dims: MoodScores) => void;
}

/** Panneau de vote Team Mood : 5 curseurs (1 à 10) + validation. */
export const MoodBoard: React.FC<MoodBoardProps> = ({ state, participants, myId, myVote, onVote }) => {
  const [scores, setScores] = useState<MoodScores>(INITIAL_MOOD_SCORES);

  useEffect(() => {
    if (myVote) setScores(myVote.dims);
  }, [myVote]);

  const voted = myVote !== undefined;
  const locked = state.revealed || voted;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <section aria-labelledby="mood-vote-title" className="mx-auto w-full max-w-xl">
        <h2 id="mood-vote-title" className="text-lg font-bold text-navy">Comment vous sentez-vous ?</h2>
        <p className="mt-1 text-sm text-muted">Notez chaque dimension de 1 à 10. Votre vote reste masqué jusqu'à la révélation.</p>

        <div className="mt-5 flex flex-col gap-5">
          {MOOD_DIMS.map((d) => {
            const val = scores[d.key];
            const pct = ((val - 1) / 9) * 100;
            return (
              <div key={d.key}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
                  <label htmlFor={`mood-${d.key}`} className="flex-1 text-sm font-bold text-navy">{d.label}</label>
                  <span className="text-sm font-extrabold text-navy" style={{ color: d.color }}>{val}</span>
                </div>
                <p className="ml-4.5 mb-1.5 text-xs text-muted">{d.sub}</p>
                <input
                  id={`mood-${d.key}`}
                  type="range"
                  min={1}
                  max={10}
                  value={val}
                  disabled={locked}
                  onChange={(e) => setScores((s) => ({ ...s, [d.key]: Number(e.target.value) }))}
                  aria-valuetext={`${val} sur 10`}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(to right, ${d.color} ${pct}%, #e2e8f0 ${pct}%)` }}
                />
              </div>
            );
          })}
        </div>

        {voted ? (
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 text-sm font-bold text-success-700">
            <Check className="h-4 w-4" aria-hidden /> Votre note est enregistrée
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onVote(scores)}
            disabled={state.revealed}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-40"
          >
            Valider ma note
          </button>
        )}
      </section>

      <section aria-labelledby="mood-players" className="mx-auto mt-8 w-full max-w-xl">
        <h2 id="mood-players" className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Participants</h2>
        <ul className="flex flex-wrap gap-3" aria-live="polite">
          {participants.map((p) => {
            const hasVoted = state.votes[p.id] !== undefined;
            return (
              <li
                key={p.id}
                className={[
                  'flex items-center gap-2 rounded-xl border-[1.5px] bg-white px-3 py-2 text-sm shadow-card',
                  hasVoted ? 'border-success-500 bg-success-50' : 'border-line',
                ].join(' ')}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: hasVoted ? '#22c55e' : p.color }}
                  aria-hidden
                >
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold text-navy">{p.name}{p.id === myId ? ' (vous)' : ''}</span>
                {hasVoted && <Check className="h-4 w-4 text-success-600" aria-hidden />}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default MoodBoard;
