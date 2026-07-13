import React from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { ToolPageShell } from '@/components/toolbox/ToolPageShell';
import { BrainstormToolbar } from '@/components/toolbox/brainstorm/BrainstormToolbar';
import { BrainstormPrepPanel } from '@/components/toolbox/brainstorm/BrainstormPrepPanel';
import { BrainstormCanvas } from '@/components/toolbox/brainstorm/BrainstormCanvas';
import { useBrainstormSession } from '@/components/toolbox/brainstorm/useBrainstormSession';

const BrainstormingPage: React.FC = () => {
  const { code, isCreating, identity, handleJoin, handleShare } = useToolPage('brainstorming');

  const {
    state, participants, isFacilitator, toggleFacilitator,
    remainingSec, myId, myNotes, actions,
  } = useBrainstormSession(code, identity);

  const me = participants.find((p) => p.id === myId);
  const revealedCount = state.notes.filter((n) => n.revealed).length;

  return (
    <ToolPageShell
      title="Brainstorming"
      code={code}
      isCreating={isCreating}
      identity={identity}
      isFacilitator={isFacilitator}
      onToggleFacilitator={toggleFacilitator}
      onJoin={handleJoin}
      onShare={handleShare}
    >
      <BrainstormToolbar
        chrono={state.chrono}
        remainingSec={remainingSec}
        isFacilitator={isFacilitator}
        notesCount={state.notes.length}
        revealedCount={revealedCount}
        onToggleChrono={actions.toggleChrono}
        onResetChrono={actions.resetChrono}
        onDurationChange={actions.setDuration}
        onExport={actions.exportSummary}
        onReset={actions.reset}
      />

      <div className="flex flex-1 overflow-hidden">
        <BrainstormPrepPanel
          myName={me?.name ?? identity?.name ?? ''}
          myColor={me?.color ?? identity?.color ?? '#94a3b8'}
          myNotes={myNotes}
          onAddNote={actions.addNote}
          onDeleteNote={actions.deleteNote}
          onRevealNext={actions.revealMyNext}
          onRevealAll={actions.revealMyAll}
          onUnreveal={actions.unrevealMine}
        />

        <BrainstormCanvas
          notes={state.notes}
          positions={state.positions}
          theme={state.theme}
          myId={myId}
          isFacilitator={isFacilitator}
          onThemeChange={actions.setTheme}
          onMove={actions.moveNote}
          onLike={actions.like}
          onDelete={actions.deleteNote}
        />
      </div>
    </ToolPageShell>
  );
};

export default BrainstormingPage;
