import React, { useRef, useState } from 'react';
import { Check, Heart, Trash2, Undo2 } from 'lucide-react';
import type { BoardNote } from '@/components/toolbox/shared/boardNotes';
import {
  SPEEDBOAT_ZONES, getSpeedboatZone,
  type CardPosition, type SpeedboatZoneKey,
} from './speedboatLogic';

interface SpeedboatSceneProps {
  notes: BoardNote[];
  positions: Record<string, CardPosition>;
  myId: string;
  isFacilitator: boolean;
  showInstructions: boolean;
  onMove: (id: string, zone: SpeedboatZoneKey, pos: CardPosition) => void;
  onVote: (id: string) => void;
  onRetain: (id: string) => void;
  onDelete: (id: string) => void;
}

const LABEL_POS: Record<string, string> = {
  tl: 'left-3 top-3', tr: 'right-3 top-3', bl: 'left-3 bottom-3', br: 'right-3 bottom-3',
};

/**
 * Scène du Speedboat : image de fond (voilier, île, ancres, récifs) avec
 * 4 zones de dépôt en surimpression. Les cartes placées sont positionnées
 * librement et déplaçables par glisser-déposer.
 */
export const SpeedboatScene: React.FC<SpeedboatSceneProps> = ({
  notes, positions, myId, isFacilitator, showInstructions, onMove, onVote, onRetain, onDelete,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<SpeedboatZoneKey | null>(null);
  const placed = notes.filter((n) => n.revealed);

  const handleDrop = (e: React.DragEvent, zone: SpeedboatZoneKey) => {
    e.preventDefault();
    setOverZone(null);
    if (!dragId || !sceneRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    const x = Math.min(0.84, Math.max(0, (e.clientX - r.left) / r.width - 0.08));
    const y = Math.min(0.86, Math.max(0, (e.clientY - r.top) / r.height - 0.04));
    onMove(dragId, zone, { x, y });
    setDragId(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-surface p-4">
      <div
        ref={sceneRef}
        className="relative mx-auto aspect-[3/2] max-h-full w-full max-w-[1100px] overflow-hidden rounded-xl shadow-card"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/speedboat-bg.png"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />

        {SPEEDBOAT_ZONES.map((z) => (
          <div
            key={z.key}
            aria-label={z.name}
            onDragOver={(e) => { e.preventDefault(); setOverZone(z.key); }}
            onDragLeave={() => setOverZone((k) => (k === z.key ? null : k))}
            onDrop={(e) => handleDrop(e, z.key)}
            className={`absolute transition-colors ${overZone === z.key ? 'bg-white/25' : ''}`}
            style={{ left: `${z.left}%`, top: `${z.top}%`, width: `${z.width}%`, height: `${z.height}%` }}
          >
            <span
              className={`absolute ${LABEL_POS[z.labelCorner]} rounded-lg border-[1.5px] bg-white/85 px-2.5 py-1 text-xs font-bold backdrop-blur-sm`}
              style={{ color: z.color, borderColor: `${z.color}55` }}
            >
              {z.name}
            </span>
            {showInstructions && (
              <span
                className={`absolute ${LABEL_POS[z.labelCorner].replace('top-3', 'top-11').replace('bottom-3', 'bottom-11')} max-w-[240px] rounded-lg bg-white/75 px-2.5 py-1.5 text-[11px] leading-snug text-navy backdrop-blur-sm`}
              >
                {z.desc}
              </span>
            )}
          </div>
        ))}

        {placed.map((n) => {
          const z = getSpeedboatZone(n.category);
          const pos = positions[n.id] ?? { x: 0.4, y: 0.4 };
          const voted = n.likedBy.includes(myId);
          const canVote = n.authorId !== myId;
          return (
            <div
              key={n.id}
              draggable
              onDragStart={() => setDragId(n.id)}
              onDragEnd={() => setDragId(null)}
              className={`absolute w-[168px] cursor-grab rounded-lg border-t-4 bg-white/95 p-2 shadow-md backdrop-blur-sm transition-shadow hover:shadow-lg active:cursor-grabbing ${
                n.retained ? 'outline outline-2 outline-warning-500' : ''
              }`}
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, borderTopColor: z.color }}
            >
              <p className="flex items-center gap-1 text-[11px] font-bold" style={{ color: n.authorColor }}>
                <span className="h-2 w-2 rounded-full" style={{ background: n.authorColor }} aria-hidden />
                {n.authorName}
                <span className="ml-auto text-[10px] font-bold opacity-80" style={{ color: z.color }}>{z.name}</span>
              </p>
              <p className="mt-1 text-xs leading-snug text-navy">{n.text}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onVote(n.id)}
                  disabled={!canVote}
                  aria-pressed={voted}
                  aria-label={voted ? `Retirer mon vote (${n.likedBy.length})` : `Voter (${n.likedBy.length})`}
                  className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-[11px] font-bold transition-colors disabled:cursor-default disabled:opacity-40"
                  style={{ color: voted ? '#ec4899' : '#94a3b8' }}
                >
                  <Heart className="h-3 w-3" style={{ fill: voted ? '#ec4899' : 'none' }} aria-hidden />
                  {n.likedBy.length}
                </button>
                {isFacilitator && (
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onRetain(n.id)}
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                        n.retained ? 'bg-warning-100 text-warning-700' : 'bg-surface text-muted hover:text-navy'
                      }`}
                    >
                      {n.retained ? <><Undo2 className="h-3 w-3" aria-hidden /> Annuler</> : <><Check className="h-3 w-3" aria-hidden /> Retenir</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(n.id)}
                      aria-label="Supprimer la carte"
                      className="rounded p-0.5 text-muted transition-colors hover:text-danger-600"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpeedboatScene;
