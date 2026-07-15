import { useCallback, useEffect, useMemo } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import { downloadTextFile } from '@/components/toolbox/shared/boardNotes';
import { generateId } from '@/utils';
import {
  INITIAL_SKILLS_STATE, MAX_SKILLS, MIN_SKILLS, SKILL_NAME_MAX,
  buildDefaultSkills, buildSkillsSummary,
  type SkillsState,
} from './skillsLogic';

/** Orchestration métier de « Compétences de l'équipe » au-dessus du socle temps réel. */
export function useSkillsSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<SkillsState>({
    toolType: 'competences',
    code,
    identity,
    initialState: INITIAL_SKILLS_STATE,
  });
  const { state, setState, isHost, isConnected } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  // Inscrit ma fiche dans l'état partagé dès la connexion (elle persiste
  // ensuite, même si je quitte la session, pour conserver mes notes).
  useEffect(() => {
    if (!isConnected || !identity) return;
    setState((p) => {
      if (p.people[identity.id]) return p;
      return {
        ...p,
        people: {
          ...p.people,
          [identity.id]: { id: identity.id, name: identity.name, color: identity.color, scores: {} },
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, identity?.id]);

  const me = useMemo(() => state.people[myId] ?? null, [state.people, myId]);

  /** Note (1–10) sur une compétence — chacun ne note que sa propre fiche. */
  const setScore = useCallback((skillId: string, value: number) => {
    setState((p) => {
      const person = p.people[myId];
      if (!person) return p;
      const val = Math.max(1, Math.min(10, Math.round(value)));
      return {
        ...p,
        people: { ...p.people, [myId]: { ...person, scores: { ...person.scores, [skillId]: val } } },
      };
    });
  }, [setState, myId]);

  const addSkill = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, SKILL_NAME_MAX);
    if (!trimmed) return;
    setState((p) => {
      if (p.skills.length >= MAX_SKILLS) return p;
      if (p.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return p;
      return { ...p, skills: [...p.skills, { id: generateId(), name: trimmed }] };
    });
  }, [setState]);

  const renameSkill = useCallback((id: string, name: string) => {
    const trimmed = name.trim().slice(0, SKILL_NAME_MAX);
    if (!trimmed) return;
    setState((p) => ({
      ...p,
      skills: p.skills.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
    }));
  }, [setState]);

  const deleteSkill = useCallback((id: string) => {
    setState((p) => {
      if (p.skills.length <= MIN_SKILLS) return p;
      const people = Object.fromEntries(
        Object.entries(p.people).map(([pid, person]) => {
          if (!(id in person.scores)) return [pid, person];
          const scores = { ...person.scores };
          delete scores[id];
          return [pid, { ...person, scores }];
        }),
      );
      return { skills: p.skills.filter((s) => s.id !== id), people };
    });
  }, [setState]);

  const exportSummary = useCallback(() => {
    downloadTextFile('competences-equipe.txt', buildSkillsSummary(state));
  }, [state]);

  /** Réinitialise notes et liste (animateur) — ma fiche est recréée par l'effet. */
  const reset = useCallback(() => {
    setState(() => ({ skills: buildDefaultSkills(), people: {} }));
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    myId,
    me,
    actions: { setScore, addSkill, renameSkill, deleteSkill, exportSummary, reset },
  };
}

export default useSkillsSession;
