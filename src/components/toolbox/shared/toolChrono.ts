/** Minuteur partagé commun aux outils (mêmes mécaniques que le Planning Poker). */
export interface ToolChrono {
  running: boolean;
  /** Timestamp (ms) de fin quand le chrono tourne, sinon null. */
  endsAt: number | null;
  /** Secondes restantes quand le chrono est en pause / à l'arrêt. */
  remainingSec: number;
  /** Durée configurée (secondes) pour un reset. */
  durationSec: number;
}

export function initialChrono(durationSec: number): ToolChrono {
  return { running: false, endsAt: null, remainingSec: durationSec, durationSec };
}

/** Secondes restantes effectives selon l'état du chrono. */
export function chronoRemaining(chrono: ToolChrono, now: number = Date.now()): number {
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

/** Parse une saisie de durée (« mm:ss », « m:ss » ou un entier = minutes) en secondes, ou null si invalide. */
export function parseDurationInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.includes(':')) {
    const [mStr, sStr = '0'] = t.split(':');
    const m = parseInt(mStr, 10);
    const s = parseInt(sStr, 10);
    if (Number.isNaN(m) || Number.isNaN(s)) return null;
    return m * 60 + s;
  }
  const n = parseInt(t, 10);
  if (Number.isNaN(n)) return null;
  return n * 60;
}

/** Bascule marche/pause du chrono (retourne le nouvel état). */
export function toggleChronoState(c: ToolChrono): ToolChrono {
  if (c.running) {
    return { ...c, running: false, endsAt: null, remainingSec: chronoRemaining(c) };
  }
  const rem = c.remainingSec > 0 ? c.remainingSec : c.durationSec;
  return { ...c, running: true, endsAt: Date.now() + rem * 1000, remainingSec: rem };
}

/** Remet le chrono à sa durée configurée. */
export function resetChronoState(c: ToolChrono): ToolChrono {
  return { ...c, running: false, endsAt: null, remainingSec: c.durationSec };
}

/** Définit une nouvelle durée (bornée entre 1 et 60 minutes). */
export function withDuration(seconds: number): ToolChrono {
  const sec = Math.max(60, Math.min(60 * 60, Math.round(seconds)));
  return { running: false, endsAt: null, remainingSec: sec, durationSec: sec };
}
