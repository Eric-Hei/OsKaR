import React from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { RevealToolbar } from '@/components/toolbox/RevealToolbar';
import { MoodBoard } from '@/components/toolbox/mood/MoodBoard';
import { MoodRadar } from '@/components/toolbox/mood/MoodRadar';
import { useMoodSession } from '@/components/toolbox/mood/useMoodSession';

const TeamMoodPage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('team-mood');

  const { state, participants, isFacilitator, toggleFacilitator, radarData, globalAvg, myId, myVote, actions } =
    useMoodSession(code, identity);

  return (
    <ToolPageShell
      title="Team Mood"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <RevealToolbar
        isFacilitator={isFacilitator}
        revealed={state.revealed}
        voteCount={Object.keys(state.votes).length}
        totalCount={participants.length}
        onReveal={actions.reveal}
        onReset={actions.reset}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <MoodBoard
            state={state}
            participants={participants}
            myId={myId}
            myVote={myVote}
            onVote={actions.vote}
          />
        </div>

        <aside
          className="flex w-[360px] shrink-0 flex-col overflow-hidden border-l border-line bg-surface"
          aria-label="Résultats du Team Mood"
        >
          <MoodRadar radarData={radarData} globalAvg={globalAvg} state={state} participants={participants} />
        </aside>
      </div>
    </ToolPageShell>
  );
};

export default TeamMoodPage;
