import type { LucideIcon } from 'lucide-react';
import {
  Layers, Star, Sunrise, Smile, Lightbulb, StickyNote,
  Scale, PartyPopper, Radar, Sailboat,
} from 'lucide-react';

/**
 * Configuration de la Boîte à outils collaborative.
 *
 * ⚙️ Paramétrage simple (pas d'interface) : modifiez les valeurs ci-dessous.
 */
export const TOOLBOX_CONFIG = {
  /**
   * Durée de conservation d'une session collaborative, en heures.
   * Au-delà, la session (et son état) est considérée expirée puis purgée.
   * Cette valeur est appliquée à la création de la session (expires_at).
   */
  sessionRetentionHours: 24,

  /** Longueur de la partie aléatoire du code de session (ex: « POKER-7K2P »). */
  sessionCodeLength: 4,

  /** Délai (ms) avant d'enregistrer un instantané d'état en base (anti-rafale). */
  snapshotDebounceMs: 800,
};

/** Durée de rétention formatée pour l'affichage utilisateur (ex: « 24 heures »). */
export function getRetentionLabel(): string {
  const h = TOOLBOX_CONFIG.sessionRetentionHours;
  if (h % 24 === 0) {
    const days = h / 24;
    return days === 1 ? '24 heures' : `${days} jours`;
  }
  return h === 1 ? '1 heure' : `${h} heures`;
}

/** Date d'expiration calculée à partir de la rétention configurée. */
export function getSessionExpiryISO(from: Date = new Date()): string {
  const ms = TOOLBOX_CONFIG.sessionRetentionHours * 60 * 60 * 1000;
  return new Date(from.getTime() + ms).toISOString();
}

/** Identifiants d'outils (sert aussi de tool_type côté base/Realtime). */
export type ToolType =
  | 'planning-poker'
  | 'roti'
  | 'daily-standup'
  | 'team-mood'
  | 'idea-box'
  | 'brainstorming'
  | 'disons-nous'
  | 'en-mode-recre'
  | 'competences'
  | 'speedboat';

export interface ToolDefinition {
  /** Identifiant technique (route + tool_type). */
  type: ToolType;
  /** Statut : seuls les outils « live » sont jouables. */
  status: 'live' | 'soon';
  title: string;
  description: string;
  /** Durée indicative de l'atelier. */
  duration: string;
  /** Fourchette de participants. */
  participants: string;
  /** Dégradé de la bannière (CSS background). */
  gradient: string;
  icon: LucideIcon;
}

/**
 * Registre des outils de la boîte à outils.
 * Au lancement, seul le Planning Poker est disponible (« live »).
 */
export const TOOLS: ToolDefinition[] = [
  {
    type: 'planning-poker',
    status: 'live',
    title: 'Planning Poker',
    description:
      "Estimez vos tâches en équipe avec les cartes de la suite de Fibonacci. Chaque participant vote en secret, puis on révèle — et on discute les écarts.",
    duration: '30 – 60 min',
    participants: '3 – 10 participants',
    gradient: 'linear-gradient(135deg, #5b21b6, #818cf8)',
    icon: Layers,
  },
  {
    type: 'roti',
    status: 'live',
    title: 'ROTI',
    description:
      "Return On Time Invested — chaque participant note la séance de 1 à 5 étoiles en secret. Révélation simultanée, score moyen et distribution des votes.",
    duration: '5 – 10 min',
    participants: "Toute l'équipe",
    gradient: 'linear-gradient(135deg, #b45309, #fbbf24)',
    icon: Star,
  },
  {
    type: 'daily-standup',
    status: 'live',
    title: 'Daily standup',
    description:
      "Un tour de table structuré en 3 questions : ce que j'ai fait, ce que je fais, mes blocages. Avec minuteur par personne pour rester dans les temps.",
    duration: '20 min max',
    participants: '3 – 20 participants',
    gradient: 'linear-gradient(135deg, #0369a1, #38bdf8)',
    icon: Sunrise,
  },
  {
    type: 'team-mood',
    status: 'live',
    title: 'Team Mood',
    description:
      "Évaluez l'état de votre équipe sur 5 dimensions — énergie, charge, sens, liens, épanouissement. Chacun note en privé, on agrège sur un radar.",
    duration: '30 – 45 min',
    participants: '3 – 15 participants',
    gradient: 'linear-gradient(135deg, #4338ca, #818cf8)',
    icon: Smile,
  },
  {
    type: 'idea-box',
    status: 'soon',
    title: 'Boîte à idées',
    description:
      "Chacun soumet ses idées, les publie dans l'espace commun et l'équipe vote avec des cœurs. L'animateur retient les meilleures en réunion.",
    duration: '30 – 45 min',
    participants: "Toute l'équipe",
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    icon: Lightbulb,
  },
  {
    type: 'brainstorming',
    status: 'soon',
    title: 'Brainstorming',
    description:
      "Un espace de post-its libres pour générer des idées ensemble. Chacun prépare ses idées en privé, puis les révèle une à une sur un canvas partagé.",
    duration: '30 – 60 min',
    participants: '2 – 20 participants',
    gradient: 'linear-gradient(135deg, #0d9466, #00d4b4)',
    icon: StickyNote,
  },
  {
    type: 'disons-nous',
    status: 'soon',
    title: 'Disons-nous les choses',
    description:
      "Deux colonnes — Freins et Moteurs — pour nommer sans détour ce qui bloque et ce qui propulse. On vote, on priorise, on retient.",
    duration: '30 – 60 min',
    participants: '3 – 15 participants',
    gradient: 'linear-gradient(135deg, #be123c, #f43f5e)',
    icon: Scale,
  },
  {
    type: 'en-mode-recre',
    status: 'live',
    title: 'En mode récré !',
    description:
      "Une rétrospective légère autour de photos partagées par l'équipe. Déposer, révéler, commenter — pour renforcer la cohésion avec bonne humeur.",
    duration: '20 – 40 min',
    participants: "Toute l'équipe",
    gradient: 'linear-gradient(135deg, #be185d, #f472b6)',
    icon: PartyPopper,
  },
  {
    type: 'competences',
    status: 'soon',
    title: "Compétences de l'équipe",
    description:
      "Chacun se note de 1 à 10 sur une liste de compétences configurables. Les radars individuels et le radar agrégé de l'équipe émergent en temps réel.",
    duration: '20 – 40 min',
    participants: '3 – 20 participants',
    gradient: 'linear-gradient(135deg, #0369a1, #7dd3fc)',
    icon: Radar,
  },
  {
    type: 'speedboat',
    status: 'soon',
    title: 'Rétrospective Speedboat',
    description:
      "Un voilier qui file vers son île au trésor. Chaque participant place ses tickets sur le tableau : vent, ancres, récifs, succès.",
    duration: '45 – 60 min',
    participants: '3 – 15 participants',
    gradient: 'linear-gradient(135deg, #0369a1, #00d4b4)',
    icon: Sailboat,
  },
];

/** Récupère la définition d'un outil par son type. */
export function getTool(type: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.type === type);
}
