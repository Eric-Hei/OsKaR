import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import type { RecreState } from './recreLogic';

interface RecreUploaderProps {
  state: RecreState;
  myName: string;
  myColor: string;
  onAddPhotos: (files: File[]) => Promise<void>;
}

interface Pending {
  file: File;
  src: string;
}

/** Panneau latéral : ajout (et prévisualisation) de ses photos avant envoi. */
export const RecreUploader: React.FC<RecreUploaderProps> = ({ state, myName, myColor, onAddPhotos }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [sending, setSending] = useState(false);
  const disabled = state.phase === 'reveal';

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPending((prev) => [...prev, { file, src: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePending = (i: number) => setPending((prev) => prev.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    if (pending.length === 0) return;
    setSending(true);
    try {
      await onAddPhotos(pending.map((p) => p.file));
      setPending([]);
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-line bg-white" aria-label="Dépôt de photos">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Mes photos</h2>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: myColor }} aria-hidden />
          {myName}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface px-4 py-6 text-center transition-colors hover:border-[#ec4899] hover:bg-[#fdf2f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4899] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-7 w-7 text-muted" aria-hidden />
          <span className="text-sm text-muted">
            <strong className="text-navy">Cliquer pour ajouter</strong>
            <br />une ou plusieurs photos
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {pending.length > 0 && (
          <ul className="flex flex-col gap-2">
            {pending.map((p, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-surface p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                <span className="min-w-0 flex-1 truncate text-xs text-navy">{p.file.name}</span>
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  aria-label={`Retirer ${p.file.name}`}
                  className="rounded p-1 text-muted transition-colors hover:bg-line hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || sending || pending.length === 0}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? (
            <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Envoi…</>
          ) : (
            <><Send className="h-4 w-4" aria-hidden /> Envoyer sur le board</>
          )}
        </button>
      </div>
    </aside>
  );
};

export default RecreUploader;
