import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToolSession, type ToolIdentity } from '@/hooks/useToolSession';
import { useFacilitator } from '@/hooks/useFacilitator';
import { useToast } from '@/hooks/useToast';
import { shootEmojis, launchFireworks } from './flyingEmoji';
import {
  INITIAL_POKER_STATE, SUITES, computeResults, chronoRemaining,
  type PokerState, type SuiteKey,
} from './pokerLogic';

/**
 * Orchestration métier du Planning Poker au-dessus du socle temps réel :
 * dérivés (chrono, résultats), effets (auto-révélation, feux d'artifice)
 * et actions (vote, suite, chrono, réactions).
 */
export function usePokerSession(code: string | null, identity: ToolIdentity | null) {
  const toast = useToast();
  const [now, setNow] = useState(() => Date.now());
  const fireworksShown = useRef(false);

  const onSignal = useCallback((payload: any) => {
    if (payload?.type === 'emoji' && typeof payload.emoji === 'string') {
      shootEmojis(payload.emoji);
    }
  }, []);

  const session = useToolSession<PokerState>({
    toolType: 'planning-poker',
    code,
    identity,
    initialState: INITIAL_POKER_STATE,
    onSignal,
  });
  const { state, setState, isHost, sendSignal } = session;
  const myId = identity?.id ?? '';

  const { isFacilitator, toggleFacilitator } = useFacilitator(isHost);

  // Tick d'affichage du chrono lorsqu'il tourne. On recale `now` dès le passage
  // en « running » (cas d'un démarrage reçu via la synchro temps réel) pour éviter
  // une valeur transitoire calculée sur une horloge figée.
  useEffect(() => {
    if (!state.chrono.running) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.chrono.running]);

  const remainingSec = chronoRemaining(state.chrono, now);
  const results = useMemo(() => computeResults(state.votes), [state.votes]);

  // Auto-révélation en fin de chrono (hôte uniquement).
  useEffect(() => {
    if (!isHost || !state.chrono.running) return;
    if (remainingSec <= 0 && !state.revealed && Object.keys(state.votes).length > 0) {
      setState((p) => ({
        ...p,
        revealed: true,
        chrono: { ...p.chrono, running: false, endsAt: null, remainingSec: 0 },
      }));
    }
  }, [isHost, remainingSec, state.chrono.running, state.revealed, state.votes, setState]);

  // Feux d'artifice au consensus parfait (une fois par révélation).
  useEffect(() => {
    if (state.revealed && results.consensus === 'perfect' && !fireworksShown.current) {
      fireworksShown.current = true;
      launchFireworks();
    }
    if (!state.revealed) fireworksShown.current = false;
  }, [state.revealed, results.consensus]);

  const vote = useCallback((value: string) => {
    setState((p) => (p.revealed ? p : { ...p, votes: { ...p.votes, [myId]: value } }));
  }, [setState, myId]);

  const setStory = useCallback((story: string) => {
    setState((p) => ({ ...p, story }));
  }, [setState]);

  const setSuite = useCallback((key: SuiteKey) => {
    setState((p) => ({
      ...p,
      suiteKey: key,
      suite: key === 'custom' ? p.suite : [...SUITES[key]],
      votes: {},
      revealed: false,
    }));
  }, [setState]);

  const applyCustom = useCallback((raw: string) => {
    const vals = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (vals.length < 2) {
      toast.warning('Ajoutez au moins 2 valeurs séparées par des virgules.');
      return;
    }
    setState((p) => ({ ...p, suiteKey: 'custom', suite: vals, votes: {}, revealed: false }));
  }, [setState, toast]);

  const reveal = useCallback(() => {
    setState((p) => ({
      ...p,
      revealed: true,
      chrono: { ...p.chrono, running: false, endsAt: null, remainingSec: chronoRemaining(p.chrono) },
    }));
  }, [setState]);

  const reset = useCallback(() => {
    setState((p) => ({ ...p, votes: {}, revealed: false }));
  }, [setState]);

  const toggleChrono = useCallback(() => {
    // Recale l'horloge d'affichage au clic : batché avec le setState ci-dessous,
    // le premier rendu utilise l'heure réelle (pas de valeur transitoire).
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

  const react = useCallback((emoji: string) => {
    shootEmojis(emoji);
    sendSignal({ type: 'emoji', emoji });
  }, [sendSignal]);

  return {
    state,
    participants: session.participants,
    isHost,
    isFacilitator,
    toggleFacilitator,
    isLoading: session.isLoading,
    remainingSec,
    results,
    myId,
    actions: { vote, setStory, setSuite, applyCustom, reveal, reset, toggleChrono, resetChrono, setDuration, react },
  };
}
