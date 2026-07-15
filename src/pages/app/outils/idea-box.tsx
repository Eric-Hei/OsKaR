import React from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { IdeaboxToolbar } from '@/components/toolbox/ideabox/IdeaboxToolbar';
import { IdeaboxComposerPanel } from '@/components/toolbox/ideabox/IdeaboxComposerPanel';
import { IdeaboxBoard } from '@/components/toolbox/ideabox/IdeaboxBoard';
import { useIdeaboxSession } from '@/components/toolbox/ideabox/useIdeaboxSession';

const IdeaBoxPage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('idea-box');

  const {
    state, participants, isFacilitator, toggleFacilitator, myId, myNotes, actions,
  } = useIdeaboxSession(code, identity);

  const me = participants.find((p) => p.id === myId);
  const publishedCount = state.notes.filter((n) => n.revealed).length;
  const retainedCount = state.notes.filter((n) => n.revealed && n.retained).length;

  return (
    <ToolPageShell
      title="Boîte à idées"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <IdeaboxToolbar
        publishedCount={publishedCount}
        retainedCount={retainedCount}
        isFacilitator={isFacilitator}
        onExport={actions.exportSummary}
        onReset={actions.reset}
      />

      <div className="flex flex-1 overflow-hidden">
        <IdeaboxComposerPanel
          myName={me?.name ?? identity?.name ?? ''}
          myColor={me?.color ?? identity?.color ?? '#94a3b8'}
          myNotes={myNotes}
          onAddDraft={actions.addDraft}
          onPublish={actions.publish}
          onDeleteDraft={actions.deleteDraft}
        />

        <IdeaboxBoard
          notes={state.notes}
          myId={myId}
          isFacilitator={isFacilitator}
          onVote={actions.vote}
          onRetain={actions.retain}
        />
      </div>
    </ToolPageShell>
  );
};

export default IdeaBoxPage;
