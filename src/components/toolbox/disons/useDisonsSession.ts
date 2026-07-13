import { useCallback, useMemo } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import {
  buildNote, notesOf, removeNote, toggleLike, toggleRetained, downloadTextFile,
} from '@/components/toolbox/shared/boardNotes';
import {
  INITIAL_DISONS_STATE, buildDisonsSummary,
  type DisonsKind, type DisonsState,
} from './disonsLogic';

/** Longueur maximale d'une carte. */
const MAX_TEXT_LENGTH = 240;

/** Orchestration métier de « Disons-nous les choses » au-dessus du socle temps réel. */
export function useDisonsSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<DisonsState>({
    toolType: 'disons-nous',
    code,
    identity,
    initialState: INITIAL_DISONS_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const myNotes = useMemo(() => notesOf(state.notes, myId), [state.notes, myId]);
  const publishedNotes = useMemo(() => state.notes.filter((n) => n.revealed), [state.notes]);

  /** Prépare une carte brouillon (visible seulement par son auteur). */
  const addDraft = useCallback((kind: DisonsKind, text: string) => {
    if (!identity || !text.trim()) return;
    const note = buildNote(identity, kind, text.slice(0, MAX_TEXT_LENGTH));
    setState((p) => ({ ...p, notes: [...p.notes, note] }));
  }, [identity, setState]);

  /** Supprime une carte : l'auteur ses brouillons, l'animateur toute carte. */
  const deleteDraft = useCallback((id: string) => {
    setState((p) => {
      const note = p.notes.find((n) => n.id === id);
      if (!note) return p;
      const isMyDraft = note.authorId === myId && !note.revealed;
      if (!isMyDraft && !isFacilitator) return p;
      return { ...p, notes: removeNote(p.notes, id) };
    });
  }, [setState, myId, isFacilitator]);

  /** Publie une carte brouillon dans sa colonne (visible par tous). */
  const publish = useCallback((id: string) => {
    setState((p) => {
      const note = p.notes.find((n) => n.id === id);
      if (!note || note.revealed) return p;
      return { ...p, notes: p.notes.map((n) => (n.id === id ? { ...n, revealed: true } : n)) };
    });
  }, [setState]);

  /** Vote cœur (impossible sur ses propres cartes). */
  const vote = useCallback((id: string) => {
    setState((p) => {
      const note = p.notes.find((n) => n.id === id);
      if (!note || note.authorId === myId) return p;
      return { ...p, notes: toggleLike(p.notes, id, myId) };
    });
  }, [setState, myId]);

  /** Marque « à retenir » (animateur). */
  const retain = useCallback((id: string) => {
    setState((p) => ({ ...p, notes: toggleRetained(p.notes, id) }));
  }, [setState]);

  const exportSummary = useCallback(() => {
    downloadTextFile('disons-nous-les-choses.txt', buildDisonsSummary(state));
  }, [state]);

  const reset = useCallback(() => {
    setState(() => INITIAL_DISONS_STATE);
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    myId,
    myNotes,
    publishedNotes,
    actions: { addDraft, deleteDraft, publish, vote, retain, exportSummary, reset },
  };
}

export default useDisonsSession;
