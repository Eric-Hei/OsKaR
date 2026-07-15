# Guide — Migrer une maquette d'outil dans OsKaR

Mémo des bonnes pratiques pour transformer une maquette HTML (`docs/inspiration/*.html`)
en outil collaboratif intégré à la **Boîte à outils** OsKaR (Next.js + Supabase Realtime).

---

## 1. Briques réutilisables (à NE PAS réécrire)

Tout outil se branche sur un socle commun. On réutilise systématiquement :

| Brique | Fichier | Rôle |
|---|---|---|
| Socle temps réel | `src/hooks/useToolSession.ts` | État partagé (broadcast last-write-wins), présence, snapshot DB |
| Page (lien + prénom) | `src/hooks/useToolPage.ts` | Code de session via URL `?s=`, identité locale, partage du lien |
| Toggle animateur | `src/hooks/useFacilitator.ts` | Mode animateur auto-promu (voir §4) |
| Coquille de page | `src/components/toolbox/ToolPageShell.tsx` | Sidebar, écran de chargement, modal prénom, en-tête |
| Registre | `src/constants/toolbox.ts` | Définition de l'outil (`ToolType`, `TOOLS`) |
| Codes de session | `src/services/toolSession.ts` | Préfixe de code (`CODE_PREFIX`) + persistance |

---

## 2. Anatomie d'un outil

Chaque outil suit le même découpage (exemple `roti`) sous
`src/components/toolbox/<outil>/` :

- **`<outil>Logic.ts`** — *logique pure* : `interface State`, `INITIAL_*_STATE`,
  fonctions de calcul/format **sans React ni I/O** (facile à tester).
- **`use<Outil>Session.ts`** — orchestration métier au-dessus de `useToolSession`
  (expose `state`, `participants`, `isFacilitator`, `actions`, valeurs dérivées).
- **Composants `*.tsx`** — UI (board, toolbar, résultats…), reçoivent l'état et
  des callbacks ; aucune logique métier dedans.
- **Page** `src/pages/app/outils/<type>.tsx` — assemble `useToolPage` +
  `ToolPageShell` + le hook de session + les composants.

---

## 3. Checklist de migration

1. **Lire la maquette** `docs/inspiration/<Nom> — OSKAR Team.html` : repérer
   l'état (données), les actions animateur vs participant, les phases.
2. **Registre** (`src/constants/toolbox.ts`) :
   - ajouter la valeur au type union `ToolType` ;
   - ajouter l'entrée dans `TOOLS` (titre, description, durée, participants,
     `gradient`, `icon` Lucide) avec `status: 'soon'` au départ.
3. **Code de session** : ajouter la clé dans `CODE_PREFIX`
   (`src/services/toolSession.ts`) — ⚠️ `Record<ToolType, string>` **exhaustif**,
   sinon le build TypeScript casse.
4. **Logique pure** : créer `<outil>Logic.ts` (état + calculs).
5. **Hook de session** : créer `use<Outil>Session.ts` au-dessus de `useToolSession`.
6. **Composants + page** : créer l'UI puis `src/pages/app/outils/<type>.tsx`.
7. **Passer `status: 'live'`** dans le registre une fois l'outil jouable.
8. **Vérifier** : `npm run type-check`, diagnostics, puis test à deux onglets.

> Tant que `status: 'soon'`, la carte s'affiche sur `/app/outils` avec « Bientôt
> disponible » et **aucune page n'est requise**. C'est un bon premier commit.

---

## 4. Bonnes pratiques

### Toggle animateur (important)
- On **ne réinvente pas** la gestion des droits : `useFacilitator(isHost)`.
- Par défaut on suit l'**hôte** (créateur). N'importe qui peut se promouvoir
  animateur localement (calqué sur la Boîte à idées) → `toggleFacilitator`.
- Le bouton est déjà câblé dans `ToolHeader` via `ToolPageShell`
  (`isFacilitator` / `onToggleFacilitator`). Côté UI, gardez les contrôles
  sensibles derrière `isFacilitator`.

### État partagé (temps réel)
- Une **seule** source de vérité : l'objet `state` passé à `useToolSession`.
- `setState` diffuse en broadcast (**last-write-wins**) + planifie un snapshot DB
  (anti-rafale, `snapshotDebounceMs`).
- À l'arrivée d'un participant, **l'hôte re-broadcast** l'état → les retardataires
  se resynchronisent (déjà géré par le socle).
- **Pas de `Math.random()` local** pour un rendu visible par tous : il divergerait
  d'un poste à l'autre. Dériver d'une valeur partagée (`startedAt`, `currentIdx`…).

### Logique pure & testable
- Tout calcul (moyennes, formats, ordre, verdicts) va dans `<outil>Logic.ts`,
  sans React. Les composants restent « bêtes ».

### Accessibilité (RGAA)
- L'information ne doit **jamais** reposer sur la seule couleur : doubler par du
  texte / `aria-label` / `sr-only`.
- États dynamiques annoncés : `role="status"` + `aria-live="polite"`.
- Labels de formulaire associés, `inputMode` adapté au mobile.

### Couleurs & identité visuelle
- Accents : Teal `#00d4b4`, Navy-dark `#151f5e`, Danger `#ef4444`,
  Warning `#fb923c`. Utiliser les classes Tailwind du thème (pas de valeurs en dur).
- Animations custom → `tailwind.config.js` (⚠️ un changement de config Tailwind
  nécessite un **redémarrage du serveur de dev** pour générer la classe).

### Données & rétention
- Sessions (et leur état) purgées après **24 h** (`TOOLBOX_CONFIG`).
- Fichiers (ex. photos « En mode récré ») → Supabase Storage, même rétention.
- **Secrets/API** : jamais dans le code, toujours dans `.env` (et `.env.exemple`
  tenu à jour, jamais le `.env` sur Git).

---

## 5. Pièges déjà rencontrés (et corrigés)

- **`<title>` avec tableau d'enfants** → React warning. Utiliser un *template
  string* : `<title>{`${title} — OsKaR`}</title>`.
- **« Flash » du chrono au démarrage** : l'horloge d'affichage (`now`) était figée.
  Recaler `setNow(Date.now())` **au moment exact** du démarrage (batché avec le
  `setState`) et au passage en `running`.
- **Labels de radar tronqués** : placer les libellés les plus longs sur l'axe du
  haut (centré, plus de place) et les plus courts sur les axes hauts-latéraux.
- **Message « taquin » toujours identique** : indexer sur `currentIdx % n` donne
  toujours `0` pour la 1ʳᵉ personne. Ajouter une **graine de séance**
  (`startedAt`) à l'index pour varier d'une session à l'autre.

---

## 6. Référence rapide des chemins

- Registre : `src/constants/toolbox.ts`
- Préfixes de code : `src/services/toolSession.ts`
- Socle temps réel : `src/hooks/useToolSession.ts`
- Page & identité : `src/hooks/useToolPage.ts`, `src/utils/toolIdentity.ts`
- Coquille : `src/components/toolbox/ToolPageShell.tsx`
- Exemple complet : `src/components/toolbox/roti/` + `src/pages/app/outils/roti.tsx`
- Maquettes sources : `docs/inspiration/*.html`
