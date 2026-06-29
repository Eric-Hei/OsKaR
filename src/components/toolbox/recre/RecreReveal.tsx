import React, { useEffect, useRef } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { launchFireworks } from '@/components/toolbox/poker/flyingEmoji';
import { findPhoto, type RecreState } from './recreLogic';

interface RecreRevealProps {
  state: RecreState;
  isFacilitator: boolean;
  myId: string;
  onRevealAuthor: () => void;
  onNextPhoto: () => void;
  onClose: () => void;
  onToggleLike: (photoId: string) => void;
}

/** Overlay plein écran : révélation synchronisée des photos une à une. */
export const RecreReveal: React.FC<RecreRevealProps> = ({
  state, isFacilitator, myId, onRevealAuthor, onNextPhoto, onClose, onToggleLike,
}) => {
  const celebrated = useRef(false);
  const currentId = state.revealOrder[state.revealIdx];
  const photo = findPhoto(state, currentId);

  // Célébration (une seule fois) quand l'auteur est dévoilé.
  useEffect(() => {
    if (state.authorShown && !celebrated.current) {
      celebrated.current = true;
      launchFireworks();
    }
    if (!state.authorShown) celebrated.current = false;
  }, [state.authorShown, state.revealIdx]);

  if (state.phase !== 'reveal' || !photo) return null;

  const liked = photo.likedBy.includes(myId);
  const count = photo.likedBy.length;
  const isLast = state.revealIdx >= state.revealOrder.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mode révélation"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-navy/95 p-6"
    >
      <span className="text-sm font-semibold tracking-wide text-white/50" aria-live="polite">
        {state.revealIdx + 1} / {state.revealOrder.length}
      </span>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt="Photo en cours de révélation"
        className="max-h-[46vh] max-w-[80vw] rounded-sm border-8 border-white object-contain shadow-card-hover"
      />

      {state.authorShown && (
        <div className="flex animate-[fadeIn_0.3s_ease-out] items-center gap-2.5 rounded-xl bg-white px-5 py-2.5 shadow-card">
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: photo.authorColor }} aria-hidden />
          <span className="text-base font-bold text-navy">{photo.authorName}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggleLike(photo.id)}
        aria-pressed={liked}
        className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-white/30 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Heart className="h-4 w-4" style={{ fill: liked ? '#ec4899' : 'none', color: liked ? '#ec4899' : 'currentColor' }} aria-hidden />
        J'aime{count > 0 ? ` · ${count}` : ''}
      </button>

      {isFacilitator ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRevealAuthor}
            disabled={state.authorShown}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-teal-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" aria-hidden /> Révéler l'auteur
          </button>
          <button
            type="button"
            onClick={onNextPhoto}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#ec4899] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#db2777] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4899]"
          >
            {isLast ? 'Terminer' : 'Photo suivante →'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-white/60" aria-live="polite">
          {state.authorShown ? "En attente de la photo suivante…" : "L'animateur va révéler l'auteur…"}
        </p>
      )}

      {isFacilitator && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le mode révélation"
          className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-4 w-4" aria-hidden /> Fermer
        </button>
      )}
    </div>
  );
};

export default RecreReveal;
