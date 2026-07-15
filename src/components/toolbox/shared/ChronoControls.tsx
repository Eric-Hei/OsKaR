import React, { useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { formatTime, parseDurationInput, type ToolChrono } from './toolChrono';

interface ChronoControlsProps {
  chrono: ToolChrono;
  remainingSec: number;
  isFacilitator: boolean;
  /** Couleur d'accent de l'outil (bordure focus, bouton actif). */
  accent: string;
  idPrefix: string;
  onToggle: () => void;
  onReset: () => void;
  onDurationChange: (seconds: number) => void;
}

/**
 * Affichage + contrôles du minuteur partagé (mêmes mécaniques que le
 * Planning Poker) : durée éditable à l'arrêt, marche/pause et reset
 * réservés à l'animateur.
 */
export const ChronoControls: React.FC<ChronoControlsProps> = ({
  chrono, remainingSec, isFacilitator, accent, idPrefix, onToggle, onReset, onDurationChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const commit = () => {
    setEditing(false);
    const sec = parseDurationInput(draft);
    if (sec != null) onDurationChange(sec);
  };

  const ratio = chrono.durationSec > 0 ? remainingSec / chrono.durationSec : 1;
  const dispClass =
    ratio <= 0.1 ? 'text-danger-600 border-danger-300 bg-danger-50 animate-pulse'
    : ratio <= 0.25 ? 'text-warning-600 border-warning-400 bg-warning-50'
    : 'text-navy border-line bg-surface';

  return (
    <div className="flex shrink-0 items-center gap-2.5">
      {isFacilitator && !chrono.running ? (
        <>
          <label htmlFor={`${idPrefix}-chrono-time`} className="sr-only">
            Durée du minuteur (minutes:secondes)
          </label>
          <input
            id={`${idPrefix}-chrono-time`}
            type="text"
            inputMode="numeric"
            value={editing ? draft : formatTime(remainingSec)}
            onFocus={() => { setDraft(formatTime(remainingSec)); setEditing(true); }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            style={{ '--tool-accent': accent } as React.CSSProperties}
            className={`w-[88px] rounded-lg border px-3 py-1.5 text-center font-mono text-lg font-bold tracking-widest outline-none focus:border-[var(--tool-accent)] ${dispClass}`}
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
            onClick={onToggle}
            style={chrono.running ? { background: accent, borderColor: accent } : undefined}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
              chrono.running ? 'text-white' : 'border-line bg-surface text-navy hover:bg-white'
            }`}
          >
            {chrono.running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            {chrono.running ? 'Pause' : 'Démarrer'}
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Réinitialiser le minuteur"
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-navy hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChronoControls;
