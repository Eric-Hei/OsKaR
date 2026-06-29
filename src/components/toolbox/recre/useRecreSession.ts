import { useCallback } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import { uploadRecrePhoto } from '@/services/recreStorage';
import { INITIAL_RECRE_STATE, shuffle, type RecrePhoto, type RecreState } from './recreLogic';

/** Orchestration métier de « En mode récré ! » au-dessus du socle temps réel. */
export function useRecreSession(code: string | null, identity: ToolIdentity | null) {
  const session = useToolSession<RecreState>({
    toolType: 'en-mode-recre',
    code,
    identity,
    initialState: INITIAL_RECRE_STATE,
  });
  const { state, setState, isHost } = session;
  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);
  const myId = identity?.id ?? '';

  const setTheme = useCallback((theme: string) => {
    setState((p) => ({ ...p, theme }));
  }, [setState]);

  /** Téléverse puis publie une à une les photos sélectionnées. */
  const addPhotos = useCallback(async (files: File[]) => {
    if (!code || !identity || files.length === 0) return;
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const url = await uploadRecrePhoto(code, id, file);
      const photo: RecrePhoto = {
        id,
        authorId: identity.id,
        authorName: identity.name,
        authorColor: identity.color,
        url,
        likedBy: [],
      };
      setState((p) => ({ ...p, photos: [...p.photos, photo] }));
    }
  }, [code, identity, setState]);

  const toggleLike = useCallback((photoId: string) => {
    setState((p) => ({
      ...p,
      photos: p.photos.map((ph) => {
        if (ph.id !== photoId) return ph;
        const liked = ph.likedBy.includes(myId);
        return {
          ...ph,
          likedBy: liked ? ph.likedBy.filter((x) => x !== myId) : [...ph.likedBy, myId],
        };
      }),
    }));
  }, [setState, myId]);

  const startReveal = useCallback(() => {
    setState((p) => {
      if (p.photos.length === 0) return p;
      return {
        ...p,
        phase: 'reveal',
        revealOrder: shuffle(p.photos.map((x) => x.id)),
        revealIdx: 0,
        authorShown: false,
      };
    });
  }, [setState]);

  const revealAuthor = useCallback(() => {
    setState((p) => ({ ...p, authorShown: true }));
  }, [setState]);

  const nextPhoto = useCallback(() => {
    setState((p) => {
      if (p.revealIdx >= p.revealOrder.length - 1) {
        return { ...p, phase: 'deposit', authorShown: false };
      }
      return { ...p, revealIdx: p.revealIdx + 1, authorShown: false };
    });
  }, [setState]);

  const closeReveal = useCallback(() => {
    setState((p) => ({ ...p, phase: 'deposit', authorShown: false }));
  }, [setState]);

  const reset = useCallback(() => {
    setState((p) => ({ ...INITIAL_RECRE_STATE, theme: p.theme }));
  }, [setState]);

  return {
    state,
    participants: session.participants,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    myId,
    actions: { setTheme, addPhotos, toggleLike, startReveal, revealAuthor, nextPhoto, closeReveal, reset },
  };
}

export default useRecreSession;
