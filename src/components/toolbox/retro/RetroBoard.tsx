import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import type { BoardNote } from '@/components/toolbox/shared/boardNotes';
import { RETRO_CATEGORIES, type RetroCategoryKey } from './retroLogic';

interface RetroBoardProps {
  notes: BoardNote[];
  myId: string;
  onMove: (id: string, category: RetroCategoryKey) => void;
  onLike: (id: string) => void;
}

/**
 * Tableau 2 × 2 des quadrants de la rétrospective. Les notes non révélées
 * apparaissent masquées (dos de carte) ; les notes révélées sont déplaçables
 * par glisser-déposer entre quadrants et « aimables ».
 */
export const RetroBoard: React.FC<RetroBoardProps> = ({ notes, myId, onMove, onLike }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<RetroCategoryKey | null>(null);

  return (
    <div className="grid flex-1 grid-cols-1 grid-rows-none gap-3 overflow-y-auto p-4 md:grid-cols-2 md:grid-rows-2">
      {RETRO_CATEGORIES.map((cat) => {
        const catNotes = notes.filter((n) => n.category === cat.key);
        return (
          <section
            key={cat.key}
            aria-label={cat.label}
            onDragOver={(e) => { e.preventDefault(); setOverKey(cat.key); }}
            onDragLeave={() => setOverKey((k) => (k === cat.key ? null : k))}
            onDrop={(e) => {
              e.preventDefault();
              setOverKey(null);
              if (dragId) onMove(dragId, cat.key);
              setDragId(null);
            }}
            className={`flex min-h-[220px] flex-col overflow-hidden rounded-xl border-2 transition-colors ${
              overKey === cat.key ? 'border-teal' : 'border-transparent'
            }`}
            style={{ background: cat.bg }}
          >
            <header className="flex items-center gap-2 px-3.5 pt-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold text-white"
                style={{ background: cat.color }}
                aria-hidden
              >
                {cat.symbol}
              </span>
              <h3 className="text-sm font-bold" style={{ color: cat.color }}>{cat.label}</h3>
              <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold text-navy">
                {catNotes.length}
              </span>
            </header>

            <ul className="flex flex-1 flex-wrap content-start items-start gap-2 p-3.5" aria-live="polite">
              {catNotes.map((n) => (
                <RetroNoteCard
                  key={n.id}
                  note={n}
                  myId={myId}
                  onLike={onLike}
                  onDragStart={() => setDragId(n.id)}
                  onDragEnd={() => setDragId(null)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

const RetroNoteCard: React.FC<{
  note: BoardNote;
  myId: string;
  onLike: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ note, myId, onLike, onDragStart, onDragEnd }) => {
  if (!note.revealed) {
    return (
      <li
        className="h-[72px] w-[150px] rounded-lg border-l-4 bg-white/55 shadow-sm"
        style={{ borderLeftColor: note.authorColor }}
        aria-label="Note masquée (non révélée)"
      />
    );
  }

  const liked = note.likedBy.includes(myId);
  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="w-[170px] cursor-grab rounded-lg border-l-4 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
      style={{ borderLeftColor: note.authorColor }}
    >
      <p className="text-[13px] leading-snug text-navy">{note.text}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: note.authorColor }} aria-hidden />
        <span className="text-[11px] font-semibold text-muted">{note.authorName}</span>
        <button
          type="button"
          onClick={() => onLike(note.id)}
          aria-pressed={liked}
          aria-label={liked ? `Je n'aime plus (${note.likedBy.length})` : `J'aime (${note.likedBy.length})`}
          className="ml-auto inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-[11px] font-bold transition-colors"
          style={{ color: liked ? '#ec4899' : '#94a3b8' }}
        >
          <Heart className="h-3 w-3" style={{ fill: liked ? '#ec4899' : 'none' }} aria-hidden />
          {note.likedBy.length > 0 && note.likedBy.length}
        </button>
      </div>
    </li>
  );
};

export default RetroBoard;
