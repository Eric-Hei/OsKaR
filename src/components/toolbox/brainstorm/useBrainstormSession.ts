import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import {
  buildNote, notesOf, removeNote, toggleLike, downloadTextFile,
} from '@/components/toolbox/shared/boardNotes';
import {
  chronoRemaining, resetChronoState, toggleChronoState, withDuration,
} from '@/components/toolbox/shared/toolChrono';
import {
  INITIAL_BRAINSTORM_STATE, buildBrainstormSummary, randomCanvasPosition,
  type BrainstormColorKey, type BrainstormState, type PostitPosition,
} from './brainstormLogic';

/** Orchestration métier du Brainstorming au-dessus du socle temps réel. */
export function useBrainstormSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<BrainstormState>({
    toolType: 'brainstorming',
    code,
    identity,
    initialState: INITIAL_BRAINSTORM_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!state.chrono.running) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.chrono.running]);
  const remainingSec = chronoRemaining(state.chrono, now);

  const myNotes = useMemo(() => notesOf(state.notes, myId), [state.notes, myId]);

  /** Prépare une idée brouillon (visible seulement par son auteur). */
  const addNote = useCallback((colorKey: BrainstormColorKey, text: string) => {
    if (!identity || !text.trim()) return;
    const note = buildNote(identity, colorKey, text);
    setState((p) => ({ ...p, notes: [...p.notes, note] }));
  }, [identity, setState]);

  const deleteNote = useCallback((id: string) => {
    setState((p) => {
      const positions = { ...p.positions };
      delete positions[id];
      return { ...p, notes: removeNote(p.notes, id), positions };
    });
  }, [setState]);

  /** Révèle la prochaine idée en attente et lui attribue une position aléatoire. */
  const revealMyNext = useCallback(() => {
    setState((p) => {
      const next = p.notes.find((n) => n.authorId === myId && !n.revealed);
      if (!next) return p;
      return {
        ...p,
        notes: p.notes.map((n) => (n.id === next.id ? { ...n, revealed: true } : n)),
        positions: { ...p.positions, [next.id]: randomCanvasPosition() },
      };
    });
  }, [setState, myId]);

  /** Révèle toutes mes idées en attente, chacune à une position aléatoire. */
  const revealMyAll = useCallback(() => {
    setState((p) => {
      const positions = { ...p.positions };
      p.notes.forEach((n) => {
        if (n.authorId === myId && !n.revealed) positions[n.id] = randomCanvasPosition();
      });
      return {
        ...p,
        notes: p.notes.map((n) => (n.authorId === myId ? { ...n, revealed: true } : n)),
        positions,
      };
    });
  }, [setState, myId]);

  /** Annule ma révélation (retour en brouillon + suppression des positions). */
  const unrevealMine = useCallback(() => {
    setState((p) => {
      const positions = { ...p.positions };
      p.notes.forEach((n) => {
        if (n.authorId === myId && n.revealed) delete positions[n.id];
      });
      return {
        ...p,
        notes: p.notes.map((n) =>
          n.authorId === myId && n.revealed
            ? { ...n, revealed: false, likedBy: [], retained: false }
            : n,
        ),
        positions,
      };
    });
  }, [setState, myId]);

  /** Déplace un post-it sur le canvas (conserve sa rotation). */
  const moveNote = useCallback((id: string, pos: Pick<PostitPosition, 'x' | 'y'>) => {
    setState((p) => {
      const prev = p.positions[id];
      if (!prev) return p;
      return { ...p, positions: { ...p.positions, [id]: { ...pos, rot: prev.rot } } };
    });
  }, [setState]);

  /** Vote cœur (autorisé sur toutes les notes, y compris les siennes). */
  const like = useCallback((id: string) => {
    setState((p) => ({ ...p, notes: toggleLike(p.notes, id, myId) }));
  }, [setState, myId]);

  const setTheme = useCallback((text: string) => {
    setState((p) => ({ ...p, theme: text }));
  }, [setState]);

  const toggleChrono = useCallback(() => {
    setNow(Date.now());
    setState((p) => ({ ...p, chrono: toggleChronoState(p.chrono) }));
  }, [setState]);

  const resetChrono = useCallback(() => {
    setState((p) => ({ ...p, chrono: resetChronoState(p.chrono) }));
  }, [setState]);

  const setDuration = useCallback((seconds: number) => {
    setState((p) => ({ ...p, chrono: withDuration(seconds) }));
  }, [setState]);

  const exportSummary = useCallback(() => {
    downloadTextFile('brainstorming.txt', buildBrainstormSummary(state));
  }, [state]);

  const reset = useCallback(() => {
    setState(() => INITIAL_BRAINSTORM_STATE);
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    remainingSec,
    myId,
    myNotes,
    actions: {
      addNote, deleteNote, revealMyNext, revealMyAll, unrevealMine,
      moveNote, like, setTheme,
      toggleChrono, resetChrono, setDuration, exportSummary, reset,
    },
  };
}

export default useBrainstormSession;
