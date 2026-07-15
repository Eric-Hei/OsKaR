import React, { useMemo } from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { DailySidebar } from '@/components/toolbox/daily/DailySidebar';
import { DailyStage } from '@/components/toolbox/daily/DailyStage';
import { useDailySession } from '@/components/toolbox/daily/useDailySession';

const DailyStandupPage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('daily-standup');

  const { state, participants, isFacilitator, toggleFacilitator, remainingSec, currentId, myId, actions } =
    useDailySession(code, identity);

  const nameById = useMemo(
    () => new Map(participants.map((p) => [p.id, p.name])),
    [participants],
  );

  const currentName = currentId ? nameById.get(currentId) ?? '' : '';
  const nextId = state.currentIdx >= 0 ? state.order[state.currentIdx + 1] : undefined;
  const nextName = nextId ? nameById.get(nextId) ?? '' : '';
  const isSelf = currentId === myId;

  return (
    <ToolPageShell
      title="Daily standup"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <div className="flex flex-1 overflow-hidden">
        <DailySidebar state={state} participants={participants} myId={myId} />
        <DailyStage
          state={state}
          currentName={currentName}
          nextName={nextName}
          isSelf={isSelf}
          remainingSec={remainingSec}
          isFacilitator={isFacilitator}
          canStart={participants.length > 0}
          onStart={actions.start}
          onPauseResume={actions.pauseResume}
          onNext={actions.next}
          onGo={actions.go}
          onStop={actions.stop}
          onDurationChange={actions.setDuration}
        />
      </div>
    </ToolPageShell>
  );
};

export default DailyStandupPage;
