import React, { useState } from 'react';
import { Pause, Play, RotateCcw, Target } from 'lucide-react';
import { formatTime, type RecreState } from './recreLogic';

interface RecreToolbarProps {
  state: RecreState;
  isFacilitator: boolean;
  remainingSec: number;
  onThemeChange: (value: string) => void;
  onToggleChrono: () => void;
  onResetChrono: () => void;
  onDurationChange: (seconds: number) => void;
  onReset: () => void;
}

/** Parse une saisie de durée (« mm:ss », « m:ss » ou un entier = minutes) en secondes, ou null si invalide. */
function parseDurationInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.includes(':')) {
    const [mStr, sStr = '0'] = t.split(':');
    const m = parseInt(mStr, 10);
    const s = parseInt(sStr, 10);
    if (Number.isNaN(m) || Number.isNaN(s)) return null;
    return m * 60 + s;
  }
  const n = parseInt(t, 10);
  if (Number.isNaN(n)) return null;
  return n * 60;
}

/**
 * Barre supérieure de « En mode récré ! » : thème de la séance (éditable par
 * l'animateur) et minuteur de dépôt des photos (mêmes mécaniques que le
 * Planning Poker).
 */
export const RecreToolbar: React.FC<RecreToolbarProps> = ({
  state, isFacilitator, remainingSec, onThemeChange, onToggleChrono, onResetChrono, onDurationChange, onReset,
}) => {
  const { chrono } = state;
  const [chronoEditing, setChronoEditing] = useState(false);
  const [chronoDraft, setChronoDraft] = useState('');

  const commitChrono = () => {
    setChronoEditing(false);
    const sec = parseDurationInput(chronoDraft);
    if (sec != null) onDurationChange(sec);
  };

  const ratio = chrono.durationSec > 0 ? remainingSec / chrono.durationSec : 1;
  const dispClass =
    ratio <= 0.1 ? 'text-danger-600 border-danger-300 bg-danger-50 animate-pulse'
    : ratio <= 0.25 ? 'text-warning-600 border-warning-400 bg-warning-50'
    : 'text-navy border-line bg-surface';

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
        <button
          type="button"
          onClick={onReset}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Réinitialiser
        </button>
      )}

      {/* Minuteur */}
      <div className="flex shrink-0 items-center gap-2.5">
        {isFacilitator && !chrono.running ? (
          <>
            <label htmlFor="recre-chrono-time" className="sr-only">
              Durée du minuteur (minutes:secondes)
            </label>
            <input
              id="recre-chrono-time"
              type="text"
              inputMode="numeric"
              value={chronoEditing ? chronoDraft : formatTime(remainingSec)}
              onFocus={() => { setChronoDraft(formatTime(remainingSec)); setChronoEditing(true); }}
              onChange={(e) => setChronoDraft(e.target.value)}
              onBlur={commitChrono}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className={`w-[88px] rounded-lg border px-3 py-1.5 text-center font-mono text-lg font-bold tracking-widest outline-none focus:border-[#ec4899] ${dispClass}`}
            />
          </>
        ) : (
          <output
            className={`min-w-[88px] rounded-lg border px-3 py-1.5 text-center font-mono text-lg font-bold tracking-widest ${dispClass}`}
            aria-label="Temps restant"
          >
            {formatTime(remainingSec)}
          </output>
        )}
        {isFacilitator && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleChrono}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                chrono.running ? 'border-[#ec4899] bg-[#ec4899] text-white' : 'border-line bg-surface text-navy hover:bg-white'
              }`}
            >
              {chrono.running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              {chrono.running ? 'Pause' : 'Démarrer'}
            </button>
            <button
              type="button"
              onClick={onResetChrono}
              aria-label="Réinitialiser le minuteur"
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-navy hover:bg-white"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecreToolbar;
