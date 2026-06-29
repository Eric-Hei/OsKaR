import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Eye, Trash2 } from 'lucide-react';
import type { SuiteKey } from './pokerLogic';
import { formatTime } from './pokerLogic';

interface PokerToolbarProps {
  isFacilitator: boolean;
  running: boolean;
  remainingSec: number;
  durationSec: number;
  revealed: boolean;
  voteCount: number;
  totalCount: number;
  suiteKey: SuiteKey;
  onToggleChrono: () => void;
  onResetChrono: () => void;
  onDurationChange: (minutes: number) => void;
  onSuiteChange: (key: SuiteKey) => void;
  onApplyCustom: (raw: string) => void;
  onReveal: () => void;
  onReset: () => void;
}

/** Barre de contrôle (chrono synchronisé + actions animateur). */
export const PokerToolbar: React.FC<PokerToolbarProps> = (props) => {
  const {
    isFacilitator, running, remainingSec, durationSec, revealed, voteCount, totalCount,
    suiteKey, onToggleChrono, onResetChrono, onDurationChange, onSuiteChange,
    onApplyCustom, onReveal, onReset,
  } = props;

  const [customRaw, setCustomRaw] = useState('');
  const ratio = durationSec > 0 ? remainingSec / durationSec : 1;
  const dispClass =
    ratio <= 0.1 ? 'text-danger-600 border-danger-300 bg-danger-50 animate-pulse'
    : ratio <= 0.25 ? 'text-warning-600 border-warning-400 bg-warning-50'
    : 'text-navy border-line bg-surface';

  return (
    <div className="flex flex-wrap items-center gap-3 bg-navy-dark px-6 py-3">
      {isFacilitator && (
        <div className="flex items-center gap-2" role="group" aria-label="Suite de votes">
          <label htmlFor="suite-select" className="text-xs font-semibold uppercase tracking-wide text-white/55">
            Suite
          </label>
          <select
            id="suite-select"
            value={suiteKey}
            onChange={(e) => onSuiteChange(e.target.value as SuiteKey)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy outline-none focus:border-teal focus-visible:ring-2 focus-visible:ring-teal"
          >
            <option value="fibonacci">Fibonacci (1,2,3,5,8,13,?)</option>
            <option value="tshirt">T-Shirts (XS,S,M,L,XL,?)</option>
            <option value="custom">Personnalisé…</option>
          </select>
          {suiteKey === 'custom' && (
            <form
              onSubmit={(e) => { e.preventDefault(); onApplyCustom(customRaw); }}
              className="flex items-center gap-1.5"
            >
              <label htmlFor="suite-custom" className="sr-only">Valeurs personnalisées (séparées par des virgules)</label>
              <input
                id="suite-custom"
                type="text"
                value={customRaw}
                onChange={(e) => setCustomRaw(e.target.value)}
                placeholder="Ex : 0,1,2,4,8,?"
                className="w-40 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-navy outline-none focus:border-teal"
              />
              <button type="submit" className="rounded-lg bg-teal px-3 py-1.5 text-sm font-bold text-navy-dark hover:bg-teal-dark">
                OK
              </button>
            </form>
          )}
        </div>
      )}

      {isFacilitator && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReveal}
            disabled={revealed || voteCount === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-navy transition-colors hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye className="h-4 w-4" aria-hidden /> Révéler
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Réinitialiser
          </button>
          <span className="text-sm text-white/70" aria-live="polite">
            <strong className="text-white">{voteCount}</strong> / {totalCount} votes
          </span>
        </div>
      )}

      {/* Chrono */}
      <div className="ml-auto flex items-center gap-2.5">
        {isFacilitator && (
          <>
            <label htmlFor="chrono-min" className="sr-only">Durée du chrono en minutes</label>
            <input
              id="chrono-min"
              type="number"
              min={1}
              max={60}
              defaultValue={Math.round(durationSec / 60)}
              onChange={(e) => onDurationChange(parseInt(e.target.value, 10) || 1)}
              className="w-16 rounded-lg border border-line bg-surface px-2 py-1.5 text-center text-sm font-semibold text-navy outline-none focus:border-teal"
            />
            <span className="text-sm text-white/55">min</span>
          </>
        )}
        <output
          className={`min-w-[68px] rounded-lg border px-3 py-1.5 text-center font-mono text-lg font-bold tracking-widest ${dispClass}`}
          aria-label="Temps restant"
        >
          {formatTime(remainingSec)}
        </output>
        {isFacilitator && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleChrono}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                running ? 'border-teal bg-teal text-navy-dark' : 'border-line bg-surface text-navy hover:bg-white'
              }`}
            >
              {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              {running ? 'Pause' : 'Démarrer'}
            </button>
            <button
              type="button"
              onClick={onResetChrono}
              aria-label="Réinitialiser le chrono"
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

export default PokerToolbar;
