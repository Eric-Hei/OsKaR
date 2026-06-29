import React, { useEffect, useState } from 'react';
import { Heart, ImageIcon, X } from 'lucide-react';
import { tiltFor, type RecreState } from './recreLogic';

interface RecreBoardProps {
  state: RecreState;
  myId: string;
  onToggleLike: (photoId: string) => void;
}

/** Galerie « polaroid » des photos déposées, avec compteur de « j'aime ». */
export const RecreBoard: React.FC<RecreBoardProps> = ({ state, myId, onToggleLike }) => {
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom]);

  if (state.photos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-muted">
        <ImageIcon className="mb-3 h-12 w-12 opacity-20" aria-hidden />
        <p className="text-sm">Les photos déposées apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6" aria-live="polite">
        {state.photos.map((photo, i) => {
          const liked = photo.likedBy.includes(myId);
          const count = photo.likedBy.length;
          return (
            <li
              key={photo.id}
              className="rounded-md bg-white p-2.5 pb-3 shadow-card transition-transform hover:z-10 hover:scale-[1.03]"
              style={{ transform: `rotate(${tiltFor(i)}deg)` }}
            >
              <button
                type="button"
                onClick={() => setZoom(photo.url)}
                className="block w-full overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4899]"
                aria-label={`Agrandir la photo de ${photo.authorName}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`Photo partagée par ${photo.authorName}`} className="aspect-square w-full object-cover" />
              </button>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: photo.authorColor }} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-navy">{photo.authorName}</span>
                <button
                  type="button"
                  onClick={() => onToggleLike(photo.id)}
                  aria-pressed={liked}
                  aria-label={liked ? `Je n'aime plus (${count})` : `J'aime (${count})`}
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4899]"
                  style={{ color: liked ? '#ec4899' : '#94a3b8' }}
                >
                  <Heart className="h-3.5 w-3.5" style={{ fill: liked ? '#ec4899' : 'none' }} aria-hidden />
                  {count > 0 && count}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-navy/90 p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Photo agrandie" className="max-h-[85vh] max-w-[88vw] rounded-sm border-8 border-white object-contain shadow-card-hover" />
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Fermer"
            className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden /> Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default RecreBoard;
