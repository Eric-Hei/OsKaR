import React, { useEffect, useRef, useState } from 'react';
import { Heart, Minus, Plus, X } from 'lucide-react';
import type { BoardNote } from '@/components/toolbox/shared/boardNotes';
import { getBrainstormColor, type PostitPosition } from './brainstormLogic';

interface BrainstormCanvasProps {
  notes: BoardNote[];
  positions: Record<string, PostitPosition>;
  theme: string;
  myId: string;
  isFacilitator: boolean;
  onThemeChange: (text: string) => void;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Motif de fond type liège (points discrets). */
const DOTS_BG: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

/**
 * Canvas libre du Brainstorming : thème partagé, zoom local et post-its
 * révélés positionnés librement, déplaçables par glisser-déposer.
 */
export const BrainstormCanvas: React.FC<BrainstormCanvasProps> = ({
  notes, positions, theme, myId, isFacilitator, onThemeChange, onMove, onLike, onDelete,
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const revealed = notes.filter((n) => n.revealed);

  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmId]);

  const applyZoom = (delta: number) => {
    setZoom((z) => Math.min(2, Math.max(0.4, Math.round((z + delta) * 10) / 10)));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || !surfaceRef.current) return;
    const r = surfaceRef.current.getBoundingClientRect();
    const x = Math.min(0.86, Math.max(0, (e.clientX - r.left) / r.width - 0.06));
    const y = Math.min(0.88, Math.max(0, (e.clientY - r.top) / r.height - 0.03));
    onMove(dragId, { x, y });
    setDragId(null);
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-surface">
      {/* Barre thème + zoom */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <label htmlFor="brainstorm-theme" className="text-xs font-bold uppercase tracking-wide text-muted">
            Thème
          </label>
          <input
            id="brainstorm-theme"
            type="text"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="Quel est le sujet de cette session ?"
            maxLength={80}
            className="w-[260px] rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted/60 focus:border-teal"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyZoom(-0.1)}
            aria-label="Dézoomer"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-white text-navy transition-colors hover:border-teal hover:text-teal"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span className="min-w-[42px] text-center text-xs font-bold text-muted" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => applyZoom(0.1)}
            aria-label="Zoomer"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-white text-navy transition-colors hover:border-teal hover:text-teal"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Surface scalée */}
      <div
        ref={surfaceRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="absolute inset-0 origin-top-left"
        style={{ ...DOTS_BG, transform: `scale(${zoom})` }}
        aria-label="Canvas des idées"
      >
        {revealed.length === 0 && (
          <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-center text-sm text-muted/70">
            Les idées révélées apparaîtront ici<br />et seront librement déplaçables
          </p>
        )}

        {revealed.map((n) => {
          const c = getBrainstormColor(n.category);
          const pos = positions[n.id] ?? { x: 0.4, y: 0.4, rot: 0 };
          const liked = n.likedBy.includes(myId);
          const canDelete = n.authorId === myId || isFacilitator;
          return (
            <div
              key={n.id}
              draggable
              onDragStart={() => setDragId(n.id)}
              onDragEnd={() => setDragId(null)}
              className="group absolute w-[180px] cursor-grab rounded border-t-[3px] p-2 pb-6 shadow-md transition-shadow hover:shadow-lg active:cursor-grabbing"
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                background: c.bg,
                borderTopColor: c.dot,
                transform: `rotate(${pos.rot}deg)`,
              }}
            >
              {canDelete && (
                confirmId === n.id ? (
                  <button
                    type="button"
                    onClick={() => { onDelete(n.id); setConfirmId(null); }}
                    className="absolute right-1 top-1 rounded bg-danger-600 px-1.5 py-0.5 text-[10px] font-bold text-white"
                  >
                    Confirmer ?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(n.id)}
                    aria-label="Supprimer le post-it"
                    className="absolute right-1 top-1 rounded p-0.5 text-navy/30 opacity-0 transition-opacity hover:text-danger-600 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )
              )}
              <p className="text-[13px] leading-snug text-navy">{n.text}</p>
              <span className="absolute bottom-1.5 left-2.5 flex items-center gap-1 text-[11px] font-semibold text-navy/40">
                <span className="h-2 w-2 rounded-full" style={{ background: n.authorColor }} aria-hidden />
                {n.authorName}
              </span>
              <button
                type="button"
                onClick={() => onLike(n.id)}
                aria-pressed={liked}
                aria-label={liked ? `Je n'aime plus (${n.likedBy.length})` : `J'aime (${n.likedBy.length})`}
                className="absolute bottom-1 right-1.5 inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-[11px] font-bold transition-colors"
                style={{ color: liked ? '#ec4899' : '#94a3b8' }}
              >
                <Heart className="h-3 w-3" style={{ fill: liked ? '#ec4899' : 'none' }} aria-hidden />
                {n.likedBy.length > 0 && n.likedBy.length}
              </button>
            </div>
          );
        })}
      </div>

      {/* Compteur */}
      <p className="pointer-events-none absolute bottom-3.5 right-4 rounded-full border border-line bg-white px-3 py-1 text-xs text-muted shadow-sm">
        <strong className="text-navy">{revealed.length}</strong> post-it{revealed.length > 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default BrainstormCanvas;
