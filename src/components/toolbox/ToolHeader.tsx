import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Share2 } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  /** Code de session affiché à côté du bouton Inviter. */
  sessionCode: string;
  isFacilitator: boolean;
  onToggleFacilitator: () => void;
  onShare: () => void;
}

/**
 * En-tête plein écran commun à tous les outils (hors AppShell : accessible
 * sans compte). Inclut le toggle « Mode animateur » auto-promu.
 */
export const ToolHeader: React.FC<ToolHeaderProps> = ({
  title, sessionCode, isFacilitator, onToggleFacilitator, onShare,
}) => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3.5 border-b border-line bg-white px-5">
      <h1 className="flex-1 truncate text-[0.95rem] font-semibold text-navy">{title}</h1>

      <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 select-none">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Mode animateur</span>
        <span className="relative inline-flex h-[22px] w-10 items-center">
          <input
            type="checkbox"
            role="switch"
            checked={isFacilitator}
            onChange={onToggleFacilitator}
            className="peer h-full w-full cursor-pointer appearance-none rounded-full bg-line transition-colors checked:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[18px]"
          />
        </span>
      </label>

      <button
        type="button"
        onClick={onShare}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Inviter
        <span className="ml-1 font-mono text-xs font-bold tracking-wider text-muted">{sessionCode}</span>
      </button>

      <Link
        href="/app/outils"
        className="ml-1 flex shrink-0 items-center gap-1.5 border-l border-line pl-3.5 text-xs font-medium text-muted transition-colors hover:text-navy"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Boîte à outils
      </Link>
    </header>
  );
};

export default ToolHeader;
