import { useCallback, useMemo } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import {
  buildNote, notesOf, removeNote, toggleLike, toggleRetained, downloadTextFile,
} from '@/components/toolbox/shared/boardNotes';
import {
  INITIAL_IDEABOX_STATE, buildIdeaboxSummary,
  type IdeaCategoryKey, type IdeaboxState,
} from './ideaboxLogic';

/** Orchestration métier de la Boîte à idées au-dessus du socle temps réel. */
export function useIdeaboxSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<IdeaboxState>({
    toolType: 'idea-box',
    code,
    identity,
    initialState: INITIAL_IDEABOX_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const myNotes = useMemo(() => notesOf(state.notes, myId), [state.notes, myId]);

  /** Prépare une idée brouillon (visible seulement par son auteur). */
  const addDraft = useCallback((category: IdeaCategoryKey, text: string) => {
    if (!identity || !text.trim()) return;
    const note = buildNote(identity, category, text.slice(0, 240));
    setState((p) => ({ ...p, notes: [...p.notes, note] }));
  }, [identity, setState]);

  /** Supprime une idée : l'animateur peut tout supprimer, l'auteur ses brouillons. */
  const deleteDraft = useCallback((id: string) => {
    setState((p) => {
      const note = p.notes.find((n) => n.id === id);
      if (!note) return p;
      if (!isFacilitator && (note.authorId !== myId || note.revealed)) return p;
      return { ...p, notes: removeNote(p.notes, id) };
    });
  }, [setState, myId, isFacilitator]);

  /** Publie une idée brouillon dans l'espace commun (visible par tous). */
  const publish = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      notes: p.notes.map((n) => (n.id === id ? { ...n, revealed: true } : n)),
    }));
  }, [setState]);

  /** Vote cœur (impossible sur ses propres idées). */
  const vote = useCallback((id: string) => {
    setState((p) => {
      const note = p.notes.find((n) => n.id === id);
      if (!note || note.authorId === myId) return p;
      return { ...p, notes: toggleLike(p.notes, id, myId) };
    });
  }, [setState, myId]);

  /** Marque « retenue » / « à retirer » (animateur). */
  const retain = useCallback((id: string) => {
    setState((p) => ({ ...p, notes: toggleRetained(p.notes, id) }));
  }, [setState]);

  const exportSummary = useCallback(() => {
    downloadTextFile('boite-a-idees.txt', buildIdeaboxSummary(state));
  }, [state]);

  const reset = useCallback(() => {
    setState(() => INITIAL_IDEABOX_STATE);
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    myId,
    myNotes,
    actions: { addDraft, deleteDraft, publish, vote, retain, exportSummary, reset },
  };
}

export default useIdeaboxSession;
