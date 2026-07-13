import { useCallback, useMemo } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import {
  buildNote, notesOf, removeNote, toggleLike, toggleRetained, downloadTextFile,
} from '@/components/toolbox/shared/boardNotes';
import {
  INITIAL_SPEEDBOAT_STATE, buildSpeedboatSummary, getSpeedboatZone, randomPositionIn,
  type CardPosition, type SpeedboatState, type SpeedboatZoneKey,
} from './speedboatLogic';

/** Orchestration métier de la Rétrospective Speedboat au-dessus du socle temps réel. */
export function useSpeedboatSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<SpeedboatState>({
    toolType: 'speedboat',
    code,
    identity,
    initialState: INITIAL_SPEEDBOAT_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const myNotes = useMemo(() => notesOf(state.notes, myId), [state.notes, myId]);
  const placedNotes = useMemo(() => state.notes.filter((n) => n.revealed), [state.notes]);

  /** Prépare une carte brouillon (visible seulement par son auteur). */
  const addDraft = useCallback((zone: SpeedboatZoneKey, text: string) => {
    if (!identity || !text.trim()) return;
    const note = buildNote(identity, zone, text);
    setState((p) => ({ ...p, notes: [...p.notes, note] }));
  }, [identity, setState]);

  /** Place une carte brouillon sur le tableau (visible par tous). */
  const publish = useCallback((id: string) => {
    setState((p) => {
      const note = p.notes.find((n) => n.id === id);
      if (!note || note.revealed) return p;
      const pos = randomPositionIn(getSpeedboatZone(note.category));
      return {
        ...p,
        notes: p.notes.map((n) => (n.id === id ? { ...n, revealed: true } : n)),
        positions: { ...p.positions, [id]: pos },
      };
    });
  }, [setState]);

  /** Déplace une carte placée (drag & drop) vers une zone + position. */
  const moveCard = useCallback((id: string, zone: SpeedboatZoneKey, pos: CardPosition) => {
    setState((p) => ({
      ...p,
      notes: p.notes.map((n) => (n.id === id && n.revealed ? { ...n, category: zone } : n)),
      positions: { ...p.positions, [id]: pos },
    }));
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

  /** Supprime une carte : l'animateur peut tout supprimer, l'auteur ses brouillons. */
  const deleteNote = useCallback((id: string) => {
    setState((p) => {
      const positions = { ...p.positions };
      delete positions[id];
      return { ...p, notes: removeNote(p.notes, id), positions };
    });
  }, [setState]);

  const exportSummary = useCallback(() => {
    downloadTextFile('retro-speedboat.txt', buildSpeedboatSummary(state));
  }, [state]);

  const reset = useCallback(() => {
    setState(() => INITIAL_SPEEDBOAT_STATE);
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    myId,
    myNotes,
    placedNotes,
    actions: { addDraft, publish, moveCard, vote, retain, deleteNote, exportSummary, reset },
  };
}

export default useSpeedboatSession;
