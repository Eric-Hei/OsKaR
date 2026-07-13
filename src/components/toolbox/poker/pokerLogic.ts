/** État partagé d'une session Planning Poker (synchronisé via Realtime). */
export interface PokerChrono {
  running: boolean;
  /** Timestamp (ms) de fin quand le chrono tourne, sinon null. */
  endsAt: number | null;
  /** Secondes restantes quand le chrono est en pause / à l'arrêt. */
  remainingSec: number;
  /** Durée configurée (secondes) pour un reset. */
  durationSec: number;
}

export type SuiteKey = 'fibonacci' | 'tshirt' | 'custom';

export interface PokerState {
  story: string;
  suiteKey: SuiteKey;
  suite: string[];
  /** participantId -> valeur votée. */
  votes: Record<string, string>;
  revealed: boolean;
  chrono: PokerChrono;
}

export const SUITES: Record<'fibonacci' | 'tshirt', string[]> = {
  fibonacci: ['1', '2', '3', '5', '8', '13', '?'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?'],
};

export const INITIAL_POKER_STATE: PokerState = {
  story: '',
  suiteKey: 'fibonacci',
  suite: [...SUITES.fibonacci],
  votes: {},
  revealed: false,
  chrono: { running: false, endsAt: null, remainingSec: 120, durationSec: 120 },
};

/** Une valeur est-elle un emoji (donc exclue de la moyenne) ? */
function isEmoji(str: string): boolean {
  try {
    return /\p{Emoji}/u.test(str) && !/^\d+$/.test(str.trim());
  } catch {
    return !/^[0-9.]+$/.test(str.trim());
  }
}

export type ConsensusLevel = 'perfect' | 'good' | 'diverge' | 'none';

export interface PokerResults {
  average: string;
  consensus: ConsensusLevel;
  distribution: { value: string; count: number }[];
  voteCount: number;
}

/** Calcule moyenne, consensus et distribution à partir des votes. */
export function computeResults(votes: Record<string, string>): PokerResults {
  const vals = Object.values(votes);
  const numericVals = vals.filter((v) => !isEmoji(v));
  const nums = numericVals.map((v) => parseFloat(v)).filter((v) => !isNaN(v));

  let average = '—';
  if (nums.length > 0) {
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    average = Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
  }

  const numericSet = [...new Set(numericVals.filter((v) => !isNaN(parseFloat(v))))];
  let consensus: ConsensusLevel = 'none';
  if (numericSet.length === 1 && nums.length > 1) {
    consensus = 'perfect';
  } else if (nums.length >= 2 && Math.max(...nums) - Math.min(...nums) <= 2) {
    consensus = 'good';
  } else if (nums.length >= 2) {
    consensus = 'diverge';
  }

  const counts: Record<string, number> = {};
  vals.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  const distribution = Object.entries(counts)
    .sort((a, b) => {
      const na = parseFloat(a[0]); const nb = parseFloat(b[0]);
      return !isNaN(na) && !isNaN(nb) ? na - nb : a[0].localeCompare(b[0]);
    })
    .map(([value, count]) => ({ value, count }));

  return { average, consensus, distribution, voteCount: vals.length };
}

/** Secondes restantes effectives selon l'état du chrono. */
export function chronoRemaining(chrono: PokerChrono, now: number = Date.now()): number {
  if (chrono.running && chrono.endsAt) {
    return Math.max(0, Math.round((chrono.endsAt - now) / 1000));
  }
  return chrono.remainingSec;
}

/** Format mm:ss. */
export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Catalogue d'émojis pour les réactions (repris des maquettes). */
export const EMOJI_CATALOG = [
  '🔥', '👏', '❤️', '👍', '🎉', '😂', '🚀', '💯', '😍', '⭐',
  '🙌', '💪', '😎', '🤔', '😅', '🥳', '🤩', '👀', '🎯', '✅',
  '⚡', '💡', '🤝', '🙏', '🤯', '🐛', '🦄', '🍕', '☕', '🏆',
];
