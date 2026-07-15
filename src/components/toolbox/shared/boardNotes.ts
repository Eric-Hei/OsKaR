import type { ToolIdentity } from '@/hooks/useToolSession';

/**
 * Socle « notes de board » partagé par les rétrospectives (4 quadrants,
 * Speedboat…) : chaque participant prépare ses notes en privé, puis les
 * révèle une à une dans une catégorie du tableau partagé.
 */
export interface BoardNote {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  /** Catégorie (quadrant / zone) où la note est classée. */
  category: string;
  text: string;
  /** false = brouillon privé (visible uniquement par l'auteur). */
  revealed: boolean;
  /** Identifiants des participants ayant voté pour la note. */
  likedBy: string[];
  /** Marquée « à retenir » par l'animateur. */
  retained: boolean;
}

/** Génère un identifiant unique de note. */
export function noteId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Construit une note brouillon pour l'identité donnée. */
export function buildNote(identity: ToolIdentity, category: string, text: string): BoardNote {
  return {
    id: noteId(),
    authorId: identity.id,
    authorName: identity.name,
    authorColor: identity.color,
    category,
    text: text.trim(),
    revealed: false,
    likedBy: [],
    retained: false,
  };
}

/** Notes d'un auteur (révélées et brouillons). */
export function notesOf(notes: BoardNote[], authorId: string): BoardNote[] {
  return notes.filter((n) => n.authorId === authorId);
}

/** Révèle la première note en attente de l'auteur ; renvoie le tableau mis à jour. */
export function revealNext(notes: BoardNote[], authorId: string): BoardNote[] {
  const next = notes.find((n) => n.authorId === authorId && !n.revealed);
  if (!next) return notes;
  return notes.map((n) => (n.id === next.id ? { ...n, revealed: true } : n));
}

/** Révèle toutes les notes en attente de l'auteur. */
export function revealAll(notes: BoardNote[], authorId: string): BoardNote[] {
  return notes.map((n) => (n.authorId === authorId ? { ...n, revealed: true } : n));
}

/** Annule la révélation des notes de l'auteur (retour en brouillon). */
export function unrevealAll(notes: BoardNote[], authorId: string): BoardNote[] {
  return notes.map((n) =>
    n.authorId === authorId && n.revealed
      ? { ...n, revealed: false, likedBy: [], retained: false }
      : n,
  );
}

/** Déplace une note révélée vers une autre catégorie. */
export function moveNote(notes: BoardNote[], id: string, category: string): BoardNote[] {
  return notes.map((n) => (n.id === id && n.revealed ? { ...n, category } : n));
}

/** Supprime une note. */
export function removeNote(notes: BoardNote[], id: string): BoardNote[] {
  return notes.filter((n) => n.id !== id);
}

/** Ajoute/retire le vote d'un participant sur une note révélée. */
export function toggleLike(notes: BoardNote[], id: string, voterId: string): BoardNote[] {
  return notes.map((n) => {
    if (n.id !== id || !n.revealed) return n;
    const liked = n.likedBy.includes(voterId);
    return { ...n, likedBy: liked ? n.likedBy.filter((x) => x !== voterId) : [...n.likedBy, voterId] };
  });
}

/** Bascule le marqueur « à retenir » d'une note révélée. */
export function toggleRetained(notes: BoardNote[], id: string): BoardNote[] {
  return notes.map((n) => (n.id === id && n.revealed ? { ...n, retained: !n.retained } : n));
}

/** Nombre de notes par catégorie (révélées ou non, comme les maquettes). */
export function countByCategory(notes: BoardNote[]): Record<string, number> {
  const counts: Record<string, number> = {};
  notes.forEach((n) => { counts[n.category] = (counts[n.category] ?? 0) + 1; });
  return counts;
}

/** Déclenche le téléchargement d'un résumé texte (export de séance). */
export function downloadTextFile(filename: string, content: string): void {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
