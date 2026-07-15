import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import {
  buildNote, moveNote, notesOf, removeNote, revealAll, revealNext,
  toggleLike, unrevealAll, downloadTextFile,
} from '@/components/toolbox/shared/boardNotes';
import {
  chronoRemaining, resetChronoState, toggleChronoState, withDuration,
} from '@/components/toolbox/shared/toolChrono';
import {
  INITIAL_RETRO_STATE, buildRetroSummary, retroActions,
  type RetroActionMeta, type RetroCategoryKey, type RetroState,
} from './retroLogic';

/** Orchestration métier de la Rétrospective d'équipe au-dessus du socle temps réel. */
export function useRetroSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<RetroState>({
    toolType: 'retrospective',
    code,
    identity,
    initialState: INITIAL_RETRO_STATE,
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
  const actions_ = useMemo(() => retroActions(state), [state]);

  const addNote = useCallback((category: RetroCategoryKey, text: string) => {
    if (!identity || !text.trim()) return;
    const note = buildNote(identity, category, text);
    setState((p) => ({ ...p, notes: [...p.notes, note] }));
  }, [identity, setState]);

  const deleteNote = useCallback((id: string) => {
    setState((p) => {
      const meta = { ...p.actionMeta };
      delete meta[id];
      return { ...p, notes: removeNote(p.notes, id), actionMeta: meta };
    });
  }, [setState]);

  const revealMyNext = useCallback(() => {
    setState((p) => ({ ...p, notes: revealNext(p.notes, myId) }));
  }, [setState, myId]);

  const revealMyAll = useCallback(() => {
    setState((p) => ({ ...p, notes: revealAll(p.notes, myId) }));
  }, [setState, myId]);

  const unrevealMine = useCallback(() => {
    setState((p) => ({ ...p, notes: unrevealAll(p.notes, myId) }));
  }, [setState, myId]);

  const moveToCategory = useCallback((id: string, category: RetroCategoryKey) => {
    setState((p) => ({ ...p, notes: moveNote(p.notes, id, category) }));
  }, [setState]);

  const like = useCallback((id: string) => {
    setState((p) => ({ ...p, notes: toggleLike(p.notes, id, myId) }));
  }, [setState, myId]);

  const setActionMeta = useCallback((id: string, patch: Partial<RetroActionMeta>) => {
    setState((p) => {
      const prev = p.actionMeta[id] ?? { resp: '', deadline: '', done: false };
      return { ...p, actionMeta: { ...p.actionMeta, [id]: { ...prev, ...patch } } };
    });
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
    downloadTextFile('retrospective.txt', buildRetroSummary(state));
  }, [state]);

  const reset = useCallback(() => {
    setState(() => INITIAL_RETRO_STATE);
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
    retroActions: actions_,
    actions: {
      addNote, deleteNote, revealMyNext, revealMyAll, unrevealMine,
      moveToCategory, like, setActionMeta,
      toggleChrono, resetChrono, setDuration, exportSummary, reset,
    },
  };
}

export default useRetroSession;
