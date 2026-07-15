import React from 'react';
import { Check, Mic } from 'lucide-react';
import type { ToolParticipant } from '@/hooks/useToolSession';
import type { DailyState } from './dailyLogic';

interface DailySidebarProps {
  state: DailyState;
  participants: ToolParticipant[];
  myId: string;
}

/** Liste latérale : ordre de passage et statut de chaque participant. */
export const DailySidebar: React.FC<DailySidebarProps> = ({ state, participants, myId }) => {
  const active = state.phase !== 'idle' && state.phase !== 'done';
  // Ordre figé pendant la séance, sinon ordre de présence courant.
  const ids = active && state.order.length ? state.order : participants.map((p) => p.id);
  const byId = new Map(participants.map((p) => [p.id, p]));

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-line bg-white" aria-label="Ordre de passage">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Tour de table</h2>
        <p className="mt-0.5 text-sm text-navy">{ids.length} participant{ids.length > 1 ? 's' : ''}</p>
      </div>
      <ul className="flex-1 overflow-y-auto p-3">
        {ids.map((id, pos) => {
          const p = byId.get(id);
          if (!p) return null;
          const isCurrent = active && pos === state.currentIdx;
          const isDone = active && pos < state.currentIdx;
          const isSelf = id === myId;
          return (
            <li
              key={id}
              className={[
                'mb-1.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
                isCurrent ? 'bg-teal-light ring-1 ring-teal' : isDone ? 'opacity-60' : '',
                isSelf && !isCurrent ? 'bg-surface' : '',
              ].join(' ')}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: p.color }}
                aria-hidden
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-navy">
                  {p.name}
                  {isSelf && <span className="ml-1 text-[11px] font-bold text-teal">vous</span>}
                </span>
                <span className="block text-[11px] text-muted">
                  {isCurrent ? 'En cours…' : isDone ? 'Terminé' : ''}
                </span>
              </span>
              {isCurrent ? (
                <Mic className="h-4 w-4 shrink-0 text-teal" aria-hidden />
              ) : isDone ? (
                <Check className="h-4 w-4 shrink-0 text-success-600" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default DailySidebar;
