import { useCallback, useEffect, useState } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import { deleteRecrePhoto, uploadRecrePhoto } from '@/services/recreStorage';
import { chronoRemaining, INITIAL_RECRE_STATE, type RecrePhoto, type RecreState } from './recreLogic';

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

  const [now, setNow] = useState(() => Date.now());

  // Tick d'affichage du chrono lorsqu'il tourne (cf. usePokerSession).
  useEffect(() => {
    if (!state.chrono.running) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.chrono.running]);

  const remainingSec = chronoRemaining(state.chrono, now);

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

  /** Supprime une de ses propres photos (déjà confirmé côté UI). */
  const removePhoto = useCallback((photoId: string) => {
    setState((p) => ({ ...p, photos: p.photos.filter((ph) => ph.id !== photoId) }));
    if (code) {
      deleteRecrePhoto(code, photoId).catch(() => {
        /* best-effort : le fichier Storage sera purgé avec la session expirée */
      });
    }
  }, [code, setState]);

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

  const toggleChrono = useCallback(() => {
    setNow(Date.now());
    setState((p) => {
      const c = p.chrono;
      if (c.running) {
        return { ...p, chrono: { ...c, running: false, endsAt: null, remainingSec: chronoRemaining(c) } };
      }
      const rem = c.remainingSec > 0 ? c.remainingSec : c.durationSec;
      return { ...p, chrono: { ...c, running: true, endsAt: Date.now() + rem * 1000, remainingSec: rem } };
    });
  }, [setState]);

  const resetChrono = useCallback(() => {
    setState((p) => ({ ...p, chrono: { ...p.chrono, running: false, endsAt: null, remainingSec: p.chrono.durationSec } }));
  }, [setState]);

  const setDuration = useCallback((seconds: number) => {
    const sec = Math.max(60, Math.min(60 * 60, Math.round(seconds)));
    setState((p) => ({ ...p, chrono: { running: false, endsAt: null, remainingSec: sec, durationSec: sec } }));
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
    remainingSec,
    myId,
    actions: { setTheme, addPhotos, removePhoto, toggleLike, toggleChrono, resetChrono, setDuration, reset },
  };
}

export default useRecreSession;
