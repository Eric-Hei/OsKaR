import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

interface SuggestToolModalProps {
  onClose: () => void;
}

/**
 * Modale « Suggérer un outil » : recueille le nom, la description et
 * (optionnellement) le prénom, puis transmet la suggestion via /api/suggest-tool.
 */
export const SuggestToolModal: React.FC<SuggestToolModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [from, setFrom] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [sent, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), from: from.trim() }),
      });
      if (!res.ok) {
        let detail = '';
        try { detail = (await res.json())?.error ?? ''; } catch { /* réponse non JSON */ }
        throw new Error(detail || 'Envoi impossible.');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggest-tool-title"
      className="fixed inset-0 z-[210] flex items-center justify-center bg-navy/60 p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="suggest-tool-title" className="text-lg font-bold text-navy">Suggérer un outil</h2>
            <p className="mt-1 text-sm text-muted">Quel rituel ou outil vous manque dans cette boîte à outils ?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded p-1 text-muted transition-colors hover:text-navy"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {sent ? (
          <div className="py-10 text-center" role="status">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-light">
              <Check className="h-6 w-6 text-teal-dark" aria-hidden />
            </span>
            <p className="text-base font-bold text-navy">Merci pour votre suggestion !</p>
            <p className="mt-2 text-sm text-muted">« <strong>{name.trim()}</strong> » a bien été transmis.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
            <div>
              <label htmlFor="suggest-name" className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                Nom de l&apos;outil ou du rituel
              </label>
              <input
                ref={nameRef}
                id="suggest-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : World Café, Check-in météo…"
                maxLength={80}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none placeholder:text-muted/60 focus:border-teal"
              />
            </div>
            <div>
              <label htmlFor="suggest-desc" className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                À quoi sert-il ? Comment ça marche ?
              </label>
              <textarea
                id="suggest-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez brièvement le format…"
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm leading-relaxed text-navy outline-none placeholder:text-muted/60 focus:border-teal"
              />
            </div>
            <div>
              <label htmlFor="suggest-from" className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                Votre prénom (optionnel)
              </label>
              <input
                id="suggest-from"
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Alice"
                maxLength={30}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none placeholder:text-muted/60 focus:border-teal"
              />
            </div>
            {error && <p className="text-sm text-danger-600" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={!name.trim() || sending}
              className="mt-1 w-full rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? 'Envoi en cours…' : 'Envoyer ma suggestion →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuggestToolModal;
