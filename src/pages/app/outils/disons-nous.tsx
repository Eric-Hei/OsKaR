import React from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { DisonsToolbar } from '@/components/toolbox/disons/DisonsToolbar';
import { DisonsComposerPanel } from '@/components/toolbox/disons/DisonsComposerPanel';
import { DisonsBoard } from '@/components/toolbox/disons/DisonsBoard';
import { useDisonsSession } from '@/components/toolbox/disons/useDisonsSession';

const DisonsNousPage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('disons-nous');

  const {
    state, participants, isFacilitator, toggleFacilitator,
    myId, myNotes, publishedNotes, actions,
  } = useDisonsSession(code, identity);

  const me = participants.find((p) => p.id === myId);
  const freinCount = publishedNotes.filter((n) => n.category === 'frein').length;
  const moteurCount = publishedNotes.filter((n) => n.category === 'moteur').length;

  return (
    <ToolPageShell
      title="Disons-nous les choses"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <DisonsToolbar
        freinCount={freinCount}
        moteurCount={moteurCount}
        isFacilitator={isFacilitator}
        onExport={actions.exportSummary}
        onReset={actions.reset}
      />

      <div className="flex flex-1 overflow-hidden">
        <DisonsComposerPanel
          myName={me?.name ?? identity?.name ?? ''}
          myColor={me?.color ?? identity?.color ?? '#94a3b8'}
          myNotes={myNotes}
          onAddDraft={actions.addDraft}
          onPublish={actions.publish}
          onDeleteDraft={actions.deleteDraft}
        />

        <DisonsBoard
          notes={state.notes}
          myId={myId}
          isFacilitator={isFacilitator}
          onVote={actions.vote}
          onRetain={actions.retain}
          onDelete={actions.deleteDraft}
        />
      </div>
    </ToolPageShell>
  );
};

export default DisonsNousPage;
