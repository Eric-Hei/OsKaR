import React from 'react';
import { Clock, Play, Pause, ChevronRight, Square, CheckCircle2 } from 'lucide-react';
import { DAILY_DURATIONS, OVERTIME_TAUNTS, formatTime, type DailyState } from './dailyLogic';

interface DailyStageProps {
  state: DailyState;
  currentName: string;
  nextName: string;
  isSelf: boolean;
  remainingSec: number;
  isFacilitator: boolean;
  canStart: boolean;
  onStart: () => void;
  onPauseResume: () => void;
  onNext: () => void;
  onGo: () => void;
  onStop: () => void;
  onDurationChange: (sec: number) => void;
}

/** Zone centrale du Daily : écrans repos / annonce / chrono / fin. */
export const DailyStage: React.FC<DailyStageProps> = (props) => {
  const { state, currentName, nextName, isSelf, remainingSec, isFacilitator, canStart } = props;
  const over = remainingSec < 0;

  const Frame: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone }) => (
    <div className={`flex flex-1 flex-col items-center justify-center p-8 text-center ${tone ?? ''}`}>{children}</div>
  );

  if (state.phase === 'idle') {
    return (
      <Frame>
        <Clock className="mb-4 h-12 w-12 text-teal" aria-hidden />
        <h2 className="text-2xl font-bold text-navy">Prêt pour le daily ?</h2>
        <p className="mt-2 max-w-sm text-muted">
          Chacun parle à son tour, dans la limite du temps imparti.
        </p>
        {isFacilitator ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="daily-duration" className="text-sm font-semibold text-muted">Temps par personne</label>
              <select
                id="daily-duration"
                value={state.durationSec}
                onChange={(e) => props.onDurationChange(Number(e.target.value))}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-navy outline-none focus:border-teal"
              >
                {DAILY_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={props.onStart}
              disabled={!canStart}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-8 py-3.5 text-base font-bold text-navy-dark shadow-card transition-colors hover:bg-teal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-5 w-5" aria-hidden /> Démarrer le daily
            </button>
            {!canStart && <p className="text-sm text-muted">En attente de participants…</p>}
          </div>
        ) : (
          <p className="mt-6 rounded-lg bg-surface px-4 py-2 text-sm text-muted">
            En attente du lancement par l'animateur.
          </p>
        )}
      </Frame>
    );
  }

  if (state.phase === 'done') {
    return (
      <Frame>
        <CheckCircle2 className="mb-4 h-14 w-14 text-success-500" aria-hidden />
        <h2 className="text-2xl font-bold text-navy">Daily terminé !</h2>
        <p className="mt-2 text-muted">Bonne journée à toute l'équipe.</p>
        {isFacilitator && (
          <button
            type="button"
            onClick={props.onStop}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Nouveau daily
          </button>
        )}
      </Frame>
    );
  }

  if (state.phase === 'next') {
    return (
      <Frame tone="bg-teal-light">
        <div className="text-lg font-medium text-muted">C'est au tour de</div>
        <div className="my-2 text-6xl font-black tracking-tight text-navy">{nextName}</div>
        {isFacilitator ? (
          <button
            type="button"
            onClick={props.onGo}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-8 py-3.5 text-base font-bold text-navy-dark shadow-card transition-colors hover:bg-teal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <Play className="h-5 w-5" aria-hidden /> C'est parti
          </button>
        ) : (
          <p className="mt-6 text-sm text-muted">En attente de l'animateur…</p>
        )}
      </Frame>
    );
  }

  // running | paused
  const elapsed = Math.max(0, state.durationSec - remainingSec);
  const elapsedRatio = state.durationSec > 0 ? elapsed / state.durationSec : 0;
  const fillPct = Math.min(100, elapsedRatio * 100);
  const past75 = elapsedRatio >= 0.75;
  // Couleur de la barre : verte, puis orange dès 75 %, puis rouge en dépassement.
  const fillColor = over ? 'bg-danger-500/40' : past75 ? 'bg-warning-400/40' : 'bg-teal/30';
  // Pas de transition au passage à 0 (nouveau tour) pour éviter un retour de barre.
  const fillTransition = fillPct <= 0 ? '' : 'transition-[width] duration-1000 ease-linear';
  // Au-delà du double du temps imparti : mode « exagération » (effets + message taquin tournant).
  const wayOver = state.durationSec > 0 && remainingSec <= -state.durationSec;
  // Graine par séance (startedAt) + index courant : la rotation ne démarre pas
  // toujours sur le même message pour la première personne d'un daily.
  const tauntLen = OVERTIME_TAUNTS.length;
  const tauntSeed = Math.floor((state.startedAt ?? 0) / 1000) + Math.max(0, state.currentIdx);
  const taunt = OVERTIME_TAUNTS[((tauntSeed % tauntLen) + tauntLen) % tauntLen];

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8 text-center">
      {/* Barre de progression en fond : temps écoulé (verte → orange à 75 % → rouge en dépassement). */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-0 ${fillColor} ${fillTransition} ${wayOver ? 'animate-pulse' : ''}`}
        style={{ width: `${fillPct}%` }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center">
        {isSelf ? (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-navy">
            <span aria-hidden>🎙</span> Vous parlez
          </div>
        ) : (
          <div className="mb-3 h-8" aria-hidden />
        )}
        <div className="text-4xl font-black tracking-tight text-navy">{currentName}</div>
        {over && <div className="mt-2 text-lg font-extrabold uppercase tracking-wide text-danger-600">Temps dépassé</div>}
        <output
          className={`my-4 inline-block font-light tabular-nums ${over ? 'text-danger-600' : 'text-navy'} ${
            wayOver ? 'animate-wobble' : remainingSec > 0 && remainingSec <= 3 ? 'animate-pulse' : ''
          }`}
          style={{ fontSize: '5.5rem', lineHeight: 1 }}
          aria-label="Temps restant"
        >
          {formatTime(remainingSec)}
        </output>

        {wayOver && (
          <div
            role="status"
            aria-live="polite"
            className="mb-2 inline-flex items-center gap-2 rounded-full bg-danger-100 px-4 py-1.5 text-sm font-bold text-danger-700 shadow-card animate-bounce-gentle"
          >
            <span className="text-lg" aria-hidden>{taunt.emoji}</span>
            {taunt.text}
          </div>
        )}

        {isFacilitator && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={props.onStop}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-danger-600 shadow-card transition-colors hover:bg-danger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <Square className="h-4 w-4" aria-hidden /> Arrêter
            </button>
            <button
              type="button"
              onClick={props.onPauseResume}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {state.phase === 'paused' ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
              {state.phase === 'paused' ? 'Reprendre' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={props.onNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              Suivant <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyStage;
