import { useCallback, useEffect, useState } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import { INITIAL_DAILY_STATE, turnRemaining, type DailyState } from './dailyLogic';

/** Orchestration métier du Daily Stand-up au-dessus du socle temps réel. */
export function useDailySession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<DailyState>({
    toolType: 'daily-standup',
    code,
    identity,
    initialState: INITIAL_DAILY_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state.phase !== 'running') return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [state.phase]);

  const remainingSec = turnRemaining(state, now);
  const currentId = state.currentIdx >= 0 ? state.order[state.currentIdx] : null;

  const start = useCallback(() => {
    setState((p) => {
      const order = session.participants.map((x) => x.id);
      if (order.length === 0) return p;
      return {
        ...p,
        phase: 'running',
        order,
        currentIdx: 0,
        endsAt: Date.now() + p.durationSec * 1000,
        remainingSec: p.durationSec,
        startedAt: Date.now(),
      };
    });
  }, [setState, session.participants]);

  const pauseResume = useCallback(() => {
    setState((p) => {
      if (p.phase === 'running') {
        return { ...p, phase: 'paused', endsAt: null, remainingSec: turnRemaining(p) };
      }
      if (p.phase === 'paused') {
        return { ...p, phase: 'running', endsAt: Date.now() + p.remainingSec * 1000 };
      }
      return p;
    });
  }, [setState]);

  const next = useCallback(() => {
    setState((p) => {
      if (p.currentIdx >= p.order.length - 1) {
        return { ...p, phase: 'done', endsAt: null, remainingSec: 0 };
      }
      return { ...p, phase: 'next', endsAt: null, remainingSec: p.durationSec };
    });
  }, [setState]);

  const go = useCallback(() => {
    setState((p) => ({
      ...p,
      phase: 'running',
      currentIdx: p.currentIdx + 1,
      endsAt: Date.now() + p.durationSec * 1000,
      remainingSec: p.durationSec,
    }));
  }, [setState]);

  const stop = useCallback(() => {
    setState((p) => ({
      ...INITIAL_DAILY_STATE,
      durationSec: p.durationSec,
    }));
  }, [setState]);

  const setDuration = useCallback((sec: number) => {
    setState((p) => (p.phase === 'idle' ? { ...p, durationSec: sec, remainingSec: sec } : p));
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    remainingSec,
    currentId,
    myId,
    actions: { start, pauseResume, next, go, stop, setDuration },
  };
}

export default useDailySession;
