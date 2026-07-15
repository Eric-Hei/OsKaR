import { useCallback, useMemo } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import {
  INITIAL_MOOD_STATE, computeMoodAverages, computeMoodGlobal,
  type MoodScores, type MoodState,
} from './moodLogic';

/** Orchestration métier du Team Mood au-dessus du socle temps réel. */
export function useMoodSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<MoodState>({
    toolType: 'team-mood',
    code,
    identity,
    initialState: INITIAL_MOOD_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const radarData = useMemo(() => computeMoodAverages(state.votes), [state.votes]);
  const globalAvg = useMemo(() => computeMoodGlobal(radarData), [radarData]);
  const myVote = state.votes[myId];

  const vote = useCallback((dims: MoodScores) => {
    setState((p) => (p.revealed ? p : { ...p, votes: { ...p.votes, [myId]: { dims } } }));
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
    radarData,
    globalAvg,
    myId,
    myVote,
    actions: { vote, reveal, reset },
  };
}

export default useMoodSession;
