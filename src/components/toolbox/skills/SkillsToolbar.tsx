import React, { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';

interface SkillsToolbarProps {
  peopleCount: number;
  completeCount: number;
  skillCount: number;
  isFacilitator: boolean;
  onExport: () => void;
  onReset: () => void;
}

/**
 * Barre supérieure de « Compétences de l'équipe » : avancement des fiches,
 * export du résumé et réinitialisation (animateur).
 */
export const SkillsToolbar: React.FC<SkillsToolbarProps> = ({
  peopleCount, completeCount, skillCount, isFacilitator, onExport, onReset,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-6 py-3">
      <p className="text-sm text-muted" aria-live="polite">
        <strong className="text-navy">{completeCount}</strong> / {peopleCount} fiche{peopleCount > 1 ? 's' : ''} complète{completeCount > 1 ? 's' : ''}
        {' · '}<strong className="text-navy">{skillCount}</strong> compétence{skillCount > 1 ? 's' : ''} évaluée{skillCount > 1 ? 's' : ''}
      </p>

      <div className="ml-auto flex flex-wrap items-center gap-2.5">
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
          aria-labelledby="skills-confirm-reset-title"
          className="fixed inset-0 z-[210] flex items-center justify-center bg-navy/60 p-6"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-hover">
            <h2 id="skills-confirm-reset-title" className="text-base font-bold text-navy">
              Réinitialiser la séance ?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Toutes les notes seront effacées et la liste des compétences
              reviendra à celle par défaut, pour tout le monde.
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

export default SkillsToolbar;
