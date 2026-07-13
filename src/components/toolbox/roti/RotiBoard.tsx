import React, { useEffect, useState } from 'react';
import { Star, Check } from 'lucide-react';
import type { ToolParticipant } from '@/hooks/useToolSession';
import { STAR_LABELS, STAR_COLORS, type RotiState, type RotiVote } from './rotiLogic';

interface RotiBoardProps {
  state: RotiState;
  participants: ToolParticipant[];
  myId: string;
  myVote: RotiVote | undefined;
  isFacilitator: boolean;
  onVote: (star: number, comment: string) => void;
  onSessionChange: (value: string) => void;
}

/** Panneau de vote ROTI : note de 1 à 5 étoiles + commentaire facultatif. */
export const RotiBoard: React.FC<RotiBoardProps> = ({
  state, participants, myId, myVote, isFacilitator, onVote, onSessionChange,
}) => {
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (myVote) {
      setSelected(myVote.star);
      setComment(myVote.comment);
    }
  }, [myVote]);

  const voted = myVote !== undefined;
  const locked = state.revealed || voted;
  const display = hover || selected;
  const color = STAR_COLORS[display] || '#cbd5e1';

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Barre séance */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-6 py-3">
        <label htmlFor="roti-session" className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted">
          Séance ›
        </label>
        <input
          id="roti-session"
          type="text"
          value={state.session}
          onChange={(e) => onSessionChange(e.target.value)}
          readOnly={!isFacilitator}
          placeholder={isFacilitator ? 'Quelle séance évaluez-vous ?…' : 'En attente du titre de séance…'}
          className="flex-1 bg-transparent text-lg font-semibold text-navy outline-none placeholder:font-normal placeholder:text-line read-only:cursor-default"
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <section aria-labelledby="roti-vote-title" className="mx-auto w-full max-w-xl">
          <h2 id="roti-vote-title" className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-muted">
            Votre note
          </h2>
          <p className="mb-4 text-center text-sm text-muted">
            Quel a été votre retour sur le temps investi ?
          </p>

          <div className="flex justify-center gap-2" role="radiogroup" aria-label="Note de 1 à 5 étoiles">
            {[1, 2, 3, 4, 5].map((v) => {
              const filled = v <= display;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={selected === v}
                  aria-label={`${v} étoile${v > 1 ? 's' : ''} — ${STAR_LABELS[v]}`}
                  disabled={locked}
                  onMouseEnter={() => !locked && setHover(v)}
                  onMouseLeave={() => setHover(0)}
                  onFocus={() => !locked && setHover(v)}
                  onBlur={() => setHover(0)}
                  onClick={() => !locked && setSelected(v)}
                  className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Star
                    className="h-10 w-10 transition-colors"
                    style={{ color, fill: filled ? color : 'none' }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-2 h-5 text-center text-sm font-semibold" style={{ color: STAR_COLORS[display] || 'transparent' }}>
            {display ? STAR_LABELS[display] : ''}
          </p>

          <label htmlFor="roti-comment" className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted">
            Commentaire (facultatif)
          </label>
          <textarea
            id="roti-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={locked}
            maxLength={200}
            rows={3}
            placeholder="Ce qui vous a le plus apporté, ou ce qu'on pourrait améliorer…"
            className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white p-3 text-sm text-navy outline-none focus:border-teal disabled:cursor-not-allowed disabled:bg-surface"
          />

          {voted ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 text-sm font-bold text-success-700">
              <Check className="h-4 w-4" aria-hidden /> Vote enregistré
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onVote(selected, comment.trim())}
              disabled={state.revealed || selected === 0}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enregistrer mon vote
            </button>
          )}
        </section>

        {/* Participants */}
        <section aria-labelledby="roti-players" className="mx-auto w-full max-w-xl">
          <h2 id="roti-players" className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            Participants
          </h2>
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
    </div>
  );
};

export default RotiBoard;
