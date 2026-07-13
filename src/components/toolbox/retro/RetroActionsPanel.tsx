import React from 'react';
import { CheckCircle2, ClipboardList, Circle } from 'lucide-react';
import type { BoardNote } from '@/components/toolbox/shared/boardNotes';
import type { RetroActionMeta } from './retroLogic';

interface RetroActionsPanelProps {
  actions: BoardNote[];
  actionMeta: Record<string, RetroActionMeta>;
  isFacilitator: boolean;
  onMetaChange: (id: string, patch: Partial<RetroActionMeta>) => void;
}

/**
 * Panneau « Actions à démarrer » : les notes révélées du quadrant ★
 * deviennent des actions avec responsable, échéance et statut.
 */
export const RetroActionsPanel: React.FC<RetroActionsPanelProps> = ({
  actions, actionMeta, isFacilitator, onMetaChange,
}) => {
  const activeCount = actions.filter((a) => !actionMeta[a.id]?.done).length;

  return (
    <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-l border-line bg-white" aria-label="Actions à démarrer">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <ClipboardList className="h-4 w-4 text-[#6366f1]" aria-hidden />
        <h3 className="text-sm font-bold text-navy">Actions à démarrer</h3>
        <span className="ml-auto text-xs font-semibold text-muted" aria-live="polite">
          {activeCount} active{activeCount > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {actions.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted">
            Les notes révélées du quadrant « À démarrer » apparaîtront ici.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {actions.map((a) => {
              const meta = actionMeta[a.id] ?? { resp: '', deadline: '', done: false };
              return (
                <li
                  key={a.id}
                  className={`rounded-lg border border-line p-2.5 ${meta.done ? 'opacity-55' : ''}`}
                >
                  <p className={`text-sm leading-snug text-navy ${meta.done ? 'line-through' : ''}`}>{a.text}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: a.authorColor }} aria-hidden />
                    {a.authorName}
                  </p>
                  {isFacilitator && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <label className="flex-1">
                          <span className="sr-only">Responsable</span>
                          <input
                            type="text"
                            value={meta.resp}
                            onChange={(e) => onMetaChange(a.id, { resp: e.target.value })}
                            placeholder="Responsable"
                            className="w-full rounded-md border border-line px-2 py-1 text-xs text-navy outline-none focus:border-teal"
                          />
                        </label>
                        <label>
                          <span className="sr-only">Échéance</span>
                          <input
                            type="date"
                            value={meta.deadline}
                            onChange={(e) => onMetaChange(a.id, { deadline: e.target.value })}
                            className="rounded-md border border-line px-2 py-1 text-xs text-navy outline-none focus:border-teal"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => onMetaChange(a.id, { done: !meta.done })}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold transition-colors ${
                          meta.done
                            ? 'bg-teal-light text-teal-dark'
                            : 'border border-line text-navy hover:bg-surface'
                        }`}
                      >
                        {meta.done
                          ? <><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Fait</>
                          : <><Circle className="h-3.5 w-3.5" aria-hidden /> Marquer fait</>}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default RetroActionsPanel;
