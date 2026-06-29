import React from 'react';
import { Eye, RotateCcw, Target } from 'lucide-react';
import type { RecreState } from './recreLogic';

interface RecreToolbarProps {
  state: RecreState;
  isFacilitator: boolean;
  photoCount: number;
  onThemeChange: (value: string) => void;
  onStartReveal: () => void;
  onReset: () => void;
}

/**
 * Barre supérieure de « En mode récré ! » : thème de la séance (éditable par
 * l'animateur) et lancement du mode révélation.
 */
export const RecreToolbar: React.FC<RecreToolbarProps> = ({
  state, isFacilitator, photoCount, onThemeChange, onStartReveal, onReset,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-6 py-3">
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
        <Target className="h-4 w-4 text-[#ec4899]" aria-hidden /> Thème
      </span>

      {isFacilitator ? (
        <label className="flex-1">
          <span className="sr-only">Thème de la séance</span>
          <input
            type="text"
            value={state.theme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="Ex : « Une photo qui résume ma semaine »…"
            className="w-full bg-transparent text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-line"
          />
        </label>
      ) : (
        <span className="flex-1 truncate text-base font-semibold text-navy">
          {state.theme || <span className="font-normal text-muted">En attente du thème…</span>}
        </span>
      )}

      {isFacilitator && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onStartReveal}
            disabled={photoCount === 0 || state.phase === 'reveal'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#ec4899] px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#db2777] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4899] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye className="h-4 w-4" aria-hidden /> Mode révélation
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};

export default RecreToolbar;
