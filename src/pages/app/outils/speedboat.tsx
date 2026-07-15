import React, { useState } from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { SpeedboatToolbar } from '@/components/toolbox/speedboat/SpeedboatToolbar';
import { SpeedboatPrepPanel } from '@/components/toolbox/speedboat/SpeedboatPrepPanel';
import { SpeedboatScene } from '@/components/toolbox/speedboat/SpeedboatScene';
import { useSpeedboatSession } from '@/components/toolbox/speedboat/useSpeedboatSession';

const SpeedboatPage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('speedboat');
  const [showInstructions, setShowInstructions] = useState(true);

  const {
    state, participants, isFacilitator, toggleFacilitator,
    myId, myNotes, placedNotes, actions,
  } = useSpeedboatSession(code, identity);

  const me = participants.find((p) => p.id === myId);

  return (
    <ToolPageShell
      title="Rétrospective Speedboat"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <SpeedboatToolbar
        placedNotes={placedNotes}
        participantsCount={participants.length}
        isFacilitator={isFacilitator}
        showInstructions={showInstructions}
        onToggleInstructions={() => setShowInstructions((v) => !v)}
        onExport={actions.exportSummary}
        onReset={actions.reset}
      />

      <div className="flex flex-1 overflow-hidden">
        <SpeedboatPrepPanel
          myName={me?.name ?? identity?.name ?? ''}
          myColor={me?.color ?? identity?.color ?? '#94a3b8'}
          myNotes={myNotes}
          onAddDraft={actions.addDraft}
          onPublish={actions.publish}
          onDeleteDraft={actions.deleteNote}
        />

        <SpeedboatScene
          notes={state.notes}
          positions={state.positions}
          myId={myId}
          isFacilitator={isFacilitator}
          showInstructions={showInstructions}
          onMove={actions.moveCard}
          onVote={actions.vote}
          onRetain={actions.retain}
          onDelete={actions.deleteNote}
        />
      </div>
    </ToolPageShell>
  );
};

export default SpeedboatPage;
