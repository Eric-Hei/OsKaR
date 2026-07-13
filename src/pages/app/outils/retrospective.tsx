import React from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { RetroToolbar } from '@/components/toolbox/retro/RetroToolbar';
import { RetroPrepPanel } from '@/components/toolbox/retro/RetroPrepPanel';
import { RetroBoard } from '@/components/toolbox/retro/RetroBoard';
import { RetroActionsPanel } from '@/components/toolbox/retro/RetroActionsPanel';
import { useRetroSession } from '@/components/toolbox/retro/useRetroSession';

const RetrospectivePage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('retrospective');

  const {
    state, participants, isFacilitator, toggleFacilitator,
    remainingSec, myId, myNotes, retroActions, actions,
  } = useRetroSession(code, identity);

  const me = participants.find((p) => p.id === myId);
  const revealedCount = state.notes.filter((n) => n.revealed).length;

  return (
    <ToolPageShell
      title="Rétrospective d'équipe"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <RetroToolbar
        chrono={state.chrono}
        remainingSec={remainingSec}
        isFacilitator={isFacilitator}
        notesCount={state.notes.length}
        revealedCount={revealedCount}
        actionsCount={retroActions.length}
        onToggleChrono={actions.toggleChrono}
        onResetChrono={actions.resetChrono}
        onDurationChange={actions.setDuration}
        onExport={actions.exportSummary}
        onReset={actions.reset}
      />

      <div className="flex flex-1 overflow-hidden">
        <RetroPrepPanel
          myName={me?.name ?? identity?.name ?? ''}
          myColor={me?.color ?? identity?.color ?? '#94a3b8'}
          myNotes={myNotes}
          onAddNote={actions.addNote}
          onDeleteNote={actions.deleteNote}
          onRevealNext={actions.revealMyNext}
          onRevealAll={actions.revealMyAll}
          onUnreveal={actions.unrevealMine}
        />

        <RetroBoard
          notes={state.notes}
          myId={myId}
          onMove={actions.moveToCategory}
          onLike={actions.like}
        />

        <RetroActionsPanel
          actions={retroActions}
          actionMeta={state.actionMeta}
          isFacilitator={isFacilitator}
          onMetaChange={actions.setActionMeta}
        />
      </div>
    </ToolPageShell>
  );
};

export default RetrospectivePage;
