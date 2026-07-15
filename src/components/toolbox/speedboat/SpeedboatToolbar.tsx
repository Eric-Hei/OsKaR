import React, { useState } from 'react';
import { Download, Eye, EyeOff, RotateCcw } from 'lucide-react';
import type { BoardNote } from '@/components/toolbox/shared/boardNotes';

interface SpeedboatToolbarProps {
  placedNotes: BoardNote[];
  participantsCount: number;
  isFacilitator: boolean;
  showInstructions: boolean;
  onToggleInstructions: () => void;
  onExport: () => void;
  onReset: () => void;
}

/**
 * Barre supérieure du Speedboat : compteurs de séance, affichage des
 * instructions de zones, export du résumé et réinitialisation (animateur).
 */
export const SpeedboatToolbar: React.FC<SpeedboatToolbarProps> = ({
  placedNotes, participantsCount, isFacilitator, showInstructions,
  onToggleInstructions, onExport, onReset,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const votes = placedNotes.reduce((s, n) => s + n.likedBy.length, 0);
  const retained = placedNotes.filter((n) => n.retained).length;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-6 py-3">
      <p className="text-sm text-muted" aria-live="polite">
        <strong className="text-navy">{placedNotes.length}</strong> ticket{placedNotes.length > 1 ? 's' : ''}
        {' · '}<strong className="text-navy">{votes}</strong> vote{votes > 1 ? 's' : ''}
        {retained > 0 && <> · <strong className="text-warning-600">{retained}</strong> retenu{retained > 1 ? 's' : ''}</>}
        {' · '}{participantsCount} participant{participantsCount > 1 ? 's' : ''}
      </p>

      <div className="ml-auto flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleInstructions}
          aria-pressed={showInstructions}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          {showInstructions ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {showInstructions ? 'Masquer les instructions' : 'Afficher les instructions'}
        </button>

        {isFacilitator && (
          <>
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <Download className="h-4 w-4" aria-hidden /> Exporter le résumé
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Réinitialiser
            </button>
          </>
        )}
      </div>

      {confirmReset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="speedboat-confirm-reset-title"
          className="fixed inset-0 z-[210] flex items-center justify-center bg-navy/60 p-6"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-hover">
            <h2 id="speedboat-confirm-reset-title" className="text-base font-bold text-navy">
              Réinitialiser le Speedboat ?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Tous les tickets et votes de la séance seront effacés pour tout le monde.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-surface"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => { onReset(); setConfirmReset(false); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-danger-600 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-danger-700"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedboatToolbar;
