import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

interface RevealToolbarProps {
  isFacilitator: boolean;
  revealed: boolean;
  voteCount: number;
  totalCount: number;
  onReveal: () => void;
  onReset: () => void;
  revealLabel?: string;
  resetLabel?: string;
  /** Contenu optionnel inséré avant les actions (ex: onglets de phase). */
  children?: React.ReactNode;
}

/**
 * Barre d'actions générique « révéler / réinitialiser » réservée à
 * l'animateur, partagée par les outils à vote secret (ROTI, Team Mood…).
 */
export const RevealToolbar: React.FC<RevealToolbarProps> = ({
  isFacilitator, revealed, voteCount, totalCount, onReveal, onReset,
  revealLabel = 'Révéler les résultats', resetLabel = 'Réinitialiser', children,
}) => {
  if (!isFacilitator) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-navy-dark px-6 py-3">
      {children}
      <button
        type="button"
        onClick={onReveal}
        disabled={revealed || voteCount === 0}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-navy transition-colors hover:bg-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Eye className="h-4 w-4" aria-hidden /> {revealLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        <Trash2 className="h-4 w-4" aria-hidden /> {resetLabel}
      </button>
      <span className="ml-auto text-sm text-white/70" aria-live="polite">
        <strong className="text-white">{voteCount}</strong> / {totalCount} ont voté
      </span>
    </div>
  );
};

export default RevealToolbar;
