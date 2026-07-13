import { useCallback, useMemo } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import { INITIAL_ROTI_STATE, computeRoti, type RotiState } from './rotiLogic';

/** Orchestration métier du ROTI au-dessus du socle temps réel. */
export function useRotiSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<RotiState>({
    toolType: 'roti',
    code,
    identity,
    initialState: INITIAL_ROTI_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const results = useMemo(() => computeRoti(state.votes), [state.votes]);
  const myVote = state.votes[myId];

  const setSession = useCallback((value: string) => {
    setState((p) => ({ ...p, session: value }));
  }, [setState]);

  const vote = useCallback((star: number, comment: string) => {
    setState((p) => (p.revealed ? p : { ...p, votes: { ...p.votes, [myId]: { star, comment } } }));
  }, [setState, myId]);

  const reveal = useCallback(() => {
    setState((p) => ({ ...p, revealed: true }));
  }, [setState]);

  const reset = useCallback(() => {
    setState((p) => ({ ...p, votes: {}, revealed: false }));
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    results,
    myId,
    myVote,
    actions: { setSession, vote, reveal, reset },
  };
}

export default useRotiSession;
