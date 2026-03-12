# PRD - OsKaR 🎯
**Product Requirements Document**

---

## 📋 Informations Générales

| **Champ** | **Valeur** |
|-----------|------------|
| **Produit** | OsKaR - Outil de gestion d'objectifs avec IA |
| **Version** | 1.3.7 |
| **Date** | Janvier 2025 |
| **Statut** | ✅ Déployé en production |
| **URL** | [https://recette-okarina.netlify.app](https://recette-okarina.netlify.app) |
| **Cible** | Entrepreneurs et dirigeants de PME |

---

## 🎯 Vision Produit

### Mission
Transformer les ambitions entrepreneuriales en résultats concrets grâce à une méthodologie OKR guidée et un accompagnement IA personnalisé.

### Vision
Devenir l'outil de référence pour la gestion d'objectifs des PME francophones, en combinant simplicité d'usage et intelligence artificielle contextuelle.

### Valeurs
- **Simplicité** : Interface intuitive et workflow guidé
- **Intelligence** : IA contextuelle basée sur le profil d'entreprise
- **Focus** : Système d'alertes pour éviter la surcharge cognitive
- **Résultats** : Méthodologie éprouvée pour atteindre ses objectifs

---

## 👥 Personas Cibles

### Persona Principal : **Marie, CEO de PME**
- **Âge** : 35-50 ans
- **Entreprise** : 10-50 employés, secteur services
- **Problèmes** :
  - Difficulté à structurer ses objectifs annuels
  - Manque de suivi régulier des progrès
  - Équipe dispersée sur les priorités
  - Pas d'expertise en méthodologie OKR
- **Besoins** :
  - Outil simple et guidé
  - Suggestions intelligentes
  - Suivi visuel des progrès
  - Export pour présentation au board

### Persona Secondaire : **Thomas, Directeur Commercial**
- **Âge** : 30-45 ans
- **Entreprise** : Responsable d'équipe commerciale
- **Problèmes** :
  - Objectifs commerciaux peu clairs
  - Difficulté à cascader les objectifs
  - Manque de visibilité sur l'avancement
- **Besoins** :
  - Objectifs SMART automatiquement validés
  - Tableau de bord en temps réel
  - Intégration avec outils existants

---

## 🏗️ Architecture Fonctionnelle

### Structure Hiérarchique
```
🎯 Ambitions Annuelles (max 3 recommandé)
├── 📊 Key Results d'Ambition (max 3 par ambition)
├── 📅 Objectifs Trimestriels (max 3 par ambition)
│   └──📈 Key Results Trimestriels (multiples par objectif)
│      └── ✅ Actions (plan d'actions par objectif)
└── 🗂️ Kanban Unique (toutes les actions par statut)
```

### Workflow Principal
1. **Profil d'Entreprise** → Configuration IA contextuelle
2. **Canvas Guidé** → Création multi-entités avec alertes
3. **Gestion Opérationnelle** → Vue hiérarchique + Kanban
4. **Suivi & Analytics** → Dashboard temps réel
5. **Rapports** → Export PDF/Excel/JSON

---

## ✨ Fonctionnalités Détaillées

### 🎨 Canvas Guidé Multi-Entités

#### Étape 1 : Ambitions Annuelles
- **Fonctionnalité** : Création de plusieurs ambitions
- **Limite** : Alerte si >3 ambitions
- **IA** : Suggestions basées sur secteur d'activité
- **Validation** : Critères SMART automatiques
- **Exemples** : Bibliothèque d'ambitions par secteur

#### Étape 2 : Key Results d'Ambition
- **Fonctionnalité** : Multiples KR par ambition
- **Limite** : Alerte si >3 KR par ambition
- **IA** : Suggestions de métriques pertinentes
- **Validation** : Mesurabilité et cohérence
- **Sélection** : Choix de l'ambition parente

#### Étape 3 : Objectifs Trimestriels
- **Fonctionnalité** : Déclinaison trimestrielle
- **Limite** : Alerte si >3 objectifs
- **IA** : Recommandations de planning
- **Rattachement** : Lien avec ambitions
- **Temporalité** : Sélection trimestre/année

#### Étape 4 : Actions Concrètes
- **Fonctionnalité** : Plan d'actions détaillé
- **Organisation** : Kanban automatique
- **Priorisation** : Système de priorités
- **Assignation** : Lien avec objectifs trimestriels

### 🤖 IA Coach Contextuelle

#### Profil d'Entreprise
- **Secteur d'activité** : 15+ secteurs prédéfinis
- **Taille d'entreprise** : Startup → Grande entreprise
- **Objectifs principaux** : Croissance, rentabilité, innovation
- **Contexte** : Marché, concurrence, défis

#### Suggestions Intelligentes
- **Validation SMART** : Analyse automatique des critères
- **Recommandations** : Basées sur profil + bonnes pratiques
- **Alertes** : Incohérences et améliorations possibles
- **Fallback** : Fonctionnement sans API (mode dégradé)

### 📊 Gestion Opérationnelle

#### Vue Hiérarchique
- **Arborescence** : Structure complète des OKR
- **Expansion** : Niveaux pliables/dépliables
- **Filtrage** : Par ambition, statut, priorité
- **Actions** : Édition inline et navigation

#### Kanban des Actions
- **Colonnes** : À faire | En cours | Terminé
- **Drag & Drop** : Changement de statut intuitif
- **Filtres** : Par objectif, priorité, échéance
- **Métriques** : Compteurs et progression

### 📈 Analytics et Suivi

#### Dashboard Temps Réel
- **Métriques Clés** : Progression globale, par ambition
- **Graphiques** : Tendances, répartition, évolution
- **Alertes** : Échéances, retards, recommandations
- **Widgets** : Personnalisables par utilisateur

#### Vue Pyramide
- **Visualisation** : Hiérarchie complète en pyramide
- **Interactions** : Zoom, navigation, détails
- **Couleurs** : Code couleur par statut/progression
- **Export** : Image haute résolution

---

## 🔧 Spécifications Techniques

### Stack Technologique
- **Frontend** : Next.js 15.5.3, React 19, TypeScript
- **Styling** : Tailwind CSS, Framer Motion
- **State** : React Query (TanStack Query) + Zustand
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **Forms** : React Hook Form + Zod validation
- **DnD** : @dnd-kit (compatible React 19)
- **IA** : Google Generative AI (Gemini 2.0 Flash Exp)
- **Export** : jsPDF, SheetJS
- **Déploiement** : Netlify (export statique)

### Architecture
- **Pattern** : JAMstack (JavaScript, APIs, Markup)
- **Rendu** : Static Site Generation (SSG)
- **Persistance** : Supabase (PostgreSQL) avec Row Level Security
- **Cache** : React Query pour optimistic updates et cache client
- **Auth** : Supabase Auth (Email/Password + Google OAuth)
- **API** : Google Generative AI (externe)
- **Build** : Next.js avec export statique

### Performance
- **First Load JS** : ~114 kB (optimisé)
- **Largest Page** : 554 kB (page rapports)
- **Build Time** : ~4 secondes
- **Deploy Time** : ~10 secondes

---

## 🎨 Design System

### Couleurs Principales
- **Primary** : Bleu (#0ea5e9) - Actions principales
- **Success** : Vert (#10b981) - Succès, validation
- **Warning** : Ambre (#f59e0b) - Alertes, attention
- **Danger** : Rouge (#ef4444) - Erreurs, suppression
- **Gray** : Nuances de gris - Textes, bordures

### Composants UI
- **Button** : 5 variants (primary, secondary, outline, ghost, danger)
- **Card** : Conteneur principal avec header/content
- **Badge** : Étiquettes colorées avec variants
- **Form** : Inputs avec validation temps réel
- **Modal** : Overlays pour actions importantes

### Animations
- **Framer Motion** : Transitions fluides
- **Micro-interactions** : Feedback utilisateur
- **Loading States** : Indicateurs de chargement
- **Hover Effects** : Retours visuels

---

## 📊 Métriques de Succès

### KPIs Produit
- **Adoption** : Nombre d'utilisateurs actifs
- **Engagement** : Sessions par utilisateur/semaine
- **Rétention** : Utilisateurs actifs à 7/30 jours
- **Completion** : % d'utilisateurs finissant le canvas

### KPIs Techniques
- **Performance** : Core Web Vitals
- **Disponibilité** : Uptime > 99.9%
- **Erreurs** : Taux d'erreur < 1%
- **Build** : Temps de déploiement < 2 min

### KPIs Business
- **Satisfaction** : NPS > 50
- **Support** : Tickets < 5% des utilisateurs
- **Conversion** : Canvas → Utilisation régulière
- **Recommandation** : Taux de partage

---

## 🚀 Roadmap Produit

### ✅ Version 1.0 (Décembre 2024)
- Canvas guidé multi-entités
- IA Coach contextuelle
- Kanban des actions
- Export complet
- Déploiement production
- RGPD et conformité légale
- PWA (Progressive Web App)

### ✅ Version 1.1 (Décembre 2024)
- Suppression vue Pyramide
- Check-in hebdo guidé par l'IA
- Focus du jour ultra-simple
- Nudges intelligents (notifications locales)
- Auto-cascade des actions depuis un KR
- Templates sectoriels (SaaS)
- Mode Rétrospective trimestrielle IA
- Health score OKR + alertes de risque

### ✅ Version 1.2 (Janvier 2025)
- Commentaires in-context + @mentions
- Partage public en 1 clic (lecture seule)
- Import CSV/Google Sheets
- PDF amélioré avec design moderne
- Correction chargement données localStorage
- Footer mis à jour

### ✅ Version 1.3 (Janvier 2025 - Actuelle)
- **Migration Supabase complète** : PostgreSQL + Auth + RLS
- **React Query** : Gestion du cache et optimistic updates
- **Authentification** : Email/Password + Google OAuth
- **Gestion d'équipes** : Page `/teams` avec invitations
- **Services DB** : 9 services Supabase avec idempotence
- **Hooks React Query** : 15+ hooks pour toutes les entités
- **Migration UI** : Dashboard, Management, Canvas, Actions vers React Query

### 🔄 Version 1.4 (Q1 2025 - Planifiée)
- Amélioration UI équipes (membres, rôles, statistiques)
- Partage d'objectifs avec équipes entières
- Page d'acceptation d'invitations
- Vue "Objectifs de mon équipe"
- Intégration Slack (slash commands)
- Partage public avancé (expiration, masquage champs)
- Scenario planning

### 🎯 Version 2.0 (Q2 2025)
- Intégrations calendrier
- API REST publique
- Application mobile native
- Analytics avancées
- IA multi-modèles
- Analyse prédictive

---

## ⚠️ Risques et Mitigation

### Risques Techniques
- **Dépendance API Gemini** → Fallback mode implémenté
- **Performance client** → Optimisation bundle size
- **Compatibilité navigateurs** → Tests cross-browser

### Risques Produit
- **Complexité perçue** → Workflow guidé simplifié
- **Adoption lente** → Onboarding amélioré
- **Concurrence** → Différenciation IA contextuelle

### Risques Business
- **Coûts API** → Monitoring et limites
- **Scalabilité** → Architecture statique
- **Sécurité données** → Stockage local uniquement

---

## 🆕 Nouvelles Fonctionnalités

### 🔒 RGPD et Conformité Légale

**Statut** : ✅ Implémenté

#### Pages Légales
- ✅ `/legal/privacy-policy` - Politique de confidentialité complète
- ✅ `/legal/terms-of-service` - Conditions générales d'utilisation
- ✅ `/legal/cookies-policy` - Politique de cookies détaillée
- ✅ `/legal/gdpr` - Gestion des droits RGPD

#### Fonctionnalités RGPD
- ✅ **Export de données** : Téléchargement JSON de toutes les données utilisateur
- ✅ **Suppression de données** : Effacement complet avec confirmation
- ✅ **Bannière de cookies** : Consentement avec personnalisation
- ✅ **Footer légal** : Liens vers toutes les pages légales
- ✅ **Transparence** : Vue d'ensemble des données stockées

**Impact** :
- Conformité 100% RGPD
- Légal pour opérer en Europe
- Confiance utilisateur renforcée

---

### 📱 PWA (Progressive Web App)

**Statut** : ✅ Implémenté

#### Fonctionnalités PWA
- ✅ **Installation** : Bannière d'installation automatique (Chrome, Edge, Safari)
- ✅ **Mode standalone** : Application sans barre d'adresse
- ✅ **Mode offline** : Cache intelligent des pages et assets
- ✅ **Raccourcis** : Accès rapide Dashboard, Canvas, Gestion
- ✅ **Share target** : Partage de contenu vers l'app (Android)
- ✅ **Icônes** : 8 tailles (72x72 à 512x512) pour tous les appareils

#### Configuration Technique
- ✅ `next-pwa` configuré avec stratégies de cache optimisées
- ✅ `manifest.json` complet avec métadonnées
- ✅ Service worker activé (désactivé en dev)
- ✅ Meta tags PWA dans `_document.tsx`

**Impact** :
- Utilisable sur mobile comme une app native
- Engagement utilisateur accru
- Expérience offline
- Notifications push (à venir)

---

### 🎯 Killer Features (Version 1.1-1.2)

**Statut** : ✅ Implémenté

#### Check-in Hebdo Guidé par l'IA
- ✅ Page `/check-in` : Revue hebdomadaire des objectifs
- ✅ Suggestions IA pour débloquer les KR en retard
- ✅ Création d'actions directement depuis les suggestions
- ✅ Analyse contextuelle basée sur le profil d'entreprise

#### Focus du Jour Ultra-Simple
- ✅ Page `/focus` : Vue simplifiée des 3 actions prioritaires
- ✅ Priorisation automatique par échéance et importance
- ✅ Interface minimaliste pour éviter la surcharge cognitive
- ✅ Engagement quotidien facilité

#### Nudges Intelligents
- ✅ Service de notifications locales
- ✅ Rappels pour actions en retard
- ✅ Alertes pour échéances proches
- ✅ Suggestions de check-in hebdomadaire
- ✅ Stockage des préférences de notification

#### Auto-Cascade des Actions
- ✅ Génération automatique d'un plan d'actions depuis un KR
- ✅ IA suggère 3-5 actions concrètes
- ✅ Création en masse avec un clic
- ✅ Intégration dans la vue hiérarchique

#### Templates Sectoriels
- ✅ Template SaaS pré-configuré dans Canvas
- ✅ Ambitions, objectifs et KR adaptés au secteur
- ✅ Chargement en un clic
- ✅ Base pour d'autres secteurs (e-commerce, services, etc.)

#### Rétrospective Trimestrielle IA
- ✅ Page `/retrospective` : Analyse de fin de trimestre
- ✅ Génération IA : réussites, blocages, priorités Q+1
- ✅ Export PDF de la rétrospective
- ✅ Visualisation des KR et actions du trimestre

#### Health Score OKR
- ✅ Calcul automatique du score de santé (0-100) par KR
- ✅ Alertes de risque pour KR en danger
- ✅ Vue d'ensemble dans Dashboard
- ✅ Top 5 des KR à risque

#### Commentaires + @Mentions
- ✅ Composant `CommentList` : Commentaires sur objectifs et KR
- ✅ Support des @mentions avec extraction regex
- ✅ Stockage localStorage (`oskar_comments`)
- ✅ Intégration dans vue hiérarchique

#### Partage Public en 1 Clic
- ✅ Service de partage avec snapshot encodé Base64
- ✅ Page `/share` : Vue publique lecture seule
- ✅ Boutons "Partager" sur objectifs et KR
- ✅ Copie automatique du lien dans le presse-papiers
- ✅ Bannière "Vue publique" avec badges

#### Import CSV/Google Sheets
- ✅ Page `/import` : Upload et mapping de CSV
- ✅ Service `importService` avec parsing PapaParse
- ✅ Auto-détection des colonnes (FR/EN)
- ✅ Création en masse : Ambitions → Objectifs → KR → Actions
- ✅ Téléchargement de template pré-rempli
- ✅ Aperçu et validation avant import

**Impact** :
- Adoption facilitée avec check-in et focus
- Engagement quotidien/hebdomadaire accru
- Productivité améliorée avec auto-cascade
- Collaboration via partage et commentaires
- Migration de données simplifiée avec import CSV

---

### 👥 Collaboration d'Équipe

**Statut** : ✅ Backend Supabase implémenté, 🔄 UI de base créée, ⏳ Fonctionnalités avancées à développer

#### Infrastructure Backend (Supabase)
- ✅ **Base de données** : 13 tables avec Row Level Security (RLS)
- ✅ **Authentification** : Email/Password + Google OAuth
- ✅ **Services DB** : 9 services Supabase complets
  - `teams.ts` : CRUD équipes avec auto-ajout du créateur comme OWNER
  - `teamMembers.ts` : Gestion membres avec rôles
  - `invitations.ts` : Invitations avec tokens et expiration
  - `sharedObjectives.ts` : Partages d'objectifs avec permissions
  - `notifications.ts` : Notifications utilisateur
  - `quarterlyObjectives.ts` : Objectifs trimestriels
  - `quarterlyKeyResults.ts` : KR trimestriels
  - `keyResults.ts` : KR d'ambitions
  - `progress.ts` : Historique de progression

#### Hooks React Query
- ✅ **useTeams** : Gestion d'équipes (create, update, delete, getByUserId)
- ✅ **useInvitations** : Invitations (create, delete, getByTeamId, getByEmail)
- ✅ **useUserNotifications** : Notifications (getByUserId, markAsRead, getUnreadCount)
- ✅ **useSharedObjectives** : Partages (create, update, delete, getByObjectiveId, getByUserId)

#### UI Implémentée
- ✅ **Page `/teams`** : Gestion d'équipes de base
  - Liste des équipes de l'utilisateur
  - Création d'équipe avec modal
  - Invitations de membres avec sélection de rôle
  - Affichage des invitations en attente
  - Notifications d'équipe
  - Suppression d'équipe (OWNER uniquement)
- ✅ **Menu utilisateur** : Lien "Mon Équipe" dans le dropdown

#### Fonctionnalités Avancées à Implémenter
- ⏳ **Liste des membres actuels** : Afficher tous les membres avec leurs rôles
- ⏳ **Modifier le rôle d'un membre** : Permettre aux OWNER/ADMIN de changer les rôles
- ⏳ **Retirer un membre** : Permettre aux OWNER/ADMIN de retirer des membres
- ⏳ **Page d'acceptation d'invitation** : `/invitations/[token]` pour accepter/refuser
- ⏳ **Partage d'objectifs avec équipe** : Partager avec toute une équipe (pas seulement utilisateurs individuels)
- ⏳ **Vue "Objectifs de mon équipe"** : Voir tous les objectifs partagés avec l'équipe
- ⏳ **Statistiques d'équipe** : Nombre d'objectifs, progression globale, membres actifs

#### Types et Enums
- ✅ `TeamRole` : OWNER, ADMIN, MEMBER, VIEWER
- ✅ `InvitationStatus` : PENDING, ACCEPTED, DECLINED, EXPIRED
- ✅ `SharePermission` : VIEW, EDIT
- ✅ `NotificationType` : 7 types (TEAM_INVITATION, TEAM_MEMBER_JOINED, OBJECTIVE_SHARED, etc.)

**Impact** :
- ✅ Collaboration multi-utilisateurs fonctionnelle
- ✅ Gestion d'équipes avec rôles et permissions
- ✅ Système d'invitations sécurisé
- ⏳ Partage d'objectifs entre équipes (à finaliser)
- ⏳ Discussions contextuelles (à implémenter)
- ⏳ Notifications en temps réel (fondations créées)

---

### 💳 Système d'Abonnement (Business Model)

**Statut** : ✅ Implémenté (Version 1.4.1)

#### Plans d'Abonnement
- ✅ **Free (0€)** : 1 utilisateur, 3 ambitions max, export PDF basique, support communautaire, 10 suggestions IA/mois
- ✅ **Pro (19€/mois)** : 5 utilisateurs, ambitions illimitées, exports avancés, intégrations basiques, IA illimitée
- ✅ **Team (49€/mois)** : 20 utilisateurs, analytics avancés, support prioritaire, rôles & permissions
- ✅ **Unlimited** : Plan spécial sans limites, assigné manuellement via Supabase

#### Infrastructure Backend
- ✅ **Table subscription_plans** : Définition des plans avec features JSON
- ✅ **Table subscriptions** : Abonnements utilisateurs avec statut
- ✅ **Fonctions PostgreSQL** :
  - `can_create_ambition(user_id)` : Vérifie si l'utilisateur peut créer une ambition
  - `can_add_team_member(user_id, team_id)` : Vérifie si l'utilisateur peut ajouter un membre
- ✅ **Trigger on_profile_created** : Création automatique d'un abonnement Free à l'inscription
- ✅ **Row Level Security (RLS)** : Politiques de sécurité sur les tables

#### UI et UX
- ✅ **Page `/pricing`** : Affichage des plans avec FAQ et CTA
- ✅ **Page `/settings` - Onglet Subscription** : Gestion de l'abonnement utilisateur
- ✅ **Composant UpgradeModal** : Modal professionnel pour inciter à l'upgrade
- ✅ **Enforcement des limites** :
  - Dashboard : Boutons "Nouvelle ambition" et "Créer ma première ambition"
  - Canvas : Bouton "Ajouter une ambition"
  - Management : Bouton "Ajouter une ambition"
- ✅ **Vérification avant action** : Le modal s'affiche immédiatement si la limite est atteinte

#### Services et Hooks
- ✅ **Service SubscriptionsService** : CRUD complet pour abonnements et plans
- ✅ **Hook useSubscription** : Récupération de l'abonnement utilisateur
- ✅ **Hook useSubscriptionPlans** : Liste des plans disponibles
- ✅ **Hook useSubscriptionUsage** : Statistiques d'utilisation (ambitions, utilisateurs)

#### Préparation Stripe (Code désactivé)
- ✅ **Routes API** : create-checkout-session, webhook (dans `api-disabled/`)
- ✅ **Intégration Stripe** : Prête à être activée quand le compte Stripe sera configuré

**Impact** :
- ✅ Modèle économique viable
- ✅ Monétisation progressive (freemium)
- ✅ Incitation à l'upgrade avec UX soignée
- ✅ Limites claires et transparentes
- ⏳ Paiements Stripe (à activer)

---

## 📊 Métriques de Succès (Mises à Jour)

### Métriques RGPD
- **Taux de consentement cookies** : Objectif > 70%
- **Taux d'export de données** : Suivi mensuel
- **Réclamations RGPD** : Objectif = 0

### Métriques PWA
- **Taux d'installation** : Objectif > 30% des utilisateurs mobiles
- **Score Lighthouse PWA** : Objectif > 90/100
- **Utilisation offline** : Suivi des sessions offline

### Métriques Killer Features
- **Taux d'utilisation Check-in** : Objectif > 60% des utilisateurs actifs/semaine
- **Taux d'utilisation Focus** : Objectif > 80% des utilisateurs actifs/jour
- **Actions auto-générées** : Objectif > 40% des KR utilisent l'auto-cascade
- **Partages publics** : Objectif > 20% des objectifs partagés
- **Imports CSV** : Objectif > 30% des nouveaux utilisateurs importent des données
- **Commentaires** : Objectif > 3 commentaires par objectif en moyenne
- **Rétrospectives** : Objectif > 70% des utilisateurs font une rétro/trimestre

### Métriques Collaboration (Futures)
- **Taux d'invitation** : Objectif > 50% des utilisateurs invitent au moins 1 personne
- **Partages d'objectifs en équipe** : Objectif > 40% des objectifs partagés

---

## 🗺️ Roadmap Mise à Jour

### ✅ Phase 1 : Production-Ready (TERMINÉ - Décembre 2024)
- ✅ RGPD et conformité légale
- ✅ PWA et mode offline
- ✅ Fondations collaboration
- ✅ Canvas guidé multi-entités
- ✅ IA Coach contextuelle
- ✅ Kanban des actions
- ✅ Export complet

### ✅ Phase 2 : Killer Features (TERMINÉ - Janvier 2025)
- ✅ Suppression vue Pyramide
- ✅ Check-in hebdo guidé par l'IA
- ✅ Focus du jour ultra-simple
- ✅ Nudges intelligents
- ✅ Auto-cascade des actions
- ✅ Templates sectoriels (SaaS)
- ✅ Rétrospective trimestrielle IA
- ✅ Health score OKR
- ✅ Commentaires + @mentions
- ✅ Partage public lecture seule
- ✅ Import CSV/Google Sheets
- ✅ PDF amélioré avec design moderne

### ✅ Phase 3 : Backend Supabase (TERMINÉ - Janvier 2025)
- ✅ Configuration Supabase (PostgreSQL, Auth, RLS)
- ✅ Authentification (email + Google OAuth)
- ✅ Migration localStorage → Supabase
- ✅ 13 tables avec Row Level Security
- ✅ 9 services DB avec idempotence + retry logic
- ✅ React Query pour cache et optimistic updates
- ✅ Migration UI complète (Dashboard, Management, Canvas, Actions)
- ✅ Page `/teams` de base avec invitations

### � Phase 4 : Amélioration Collaboration UI (Q1 2025 - En cours)
- ✅ Page gestion d'équipe de base
- ⏳ Liste et gestion des membres actuels
- ⏳ Modification des rôles (OWNER/ADMIN)
- ⏳ Retrait de membres
- ⏳ Page d'acceptation d'invitations `/invitations/[token]`
- ⏳ Partage d'objectifs avec équipes entières
- ⏳ Vue "Objectifs de mon équipe"
- ⏳ Statistiques d'équipe
- ⏳ Centre de notifications

### � Phase 5 : Intégrations & Partage Avancé (Q2 2025)
- ⏳ Intégration Slack (slash commands + webhooks)
- ⏳ Partage public avancé (expiration, masquage champs)
- ⏳ Scenario planning (what-if analysis)
- ⏳ Templates sectoriels additionnels (e-commerce, services, etc.)
- ⏳ Commentaires et discussions en temps réel

### 🔮 Phase 6 : Fonctionnalités Avancées (Q3-Q4 2025)
- 🔮 Notifications push
- 🔮 Analytics avancés
- 🔮 Application mobile native
- 🔮 API REST publique
- 🔮 IA multi-modèles
- 🔮 Analyse prédictive
- 🔮 Synchronisation multi-appareils temps réel

---

## 🔐 Audit Sécurité — Mars 2026

### Synthèse
- **Critique** : une clé Gemini est visible dans un artefact compilé sous `out/_next/...`; la clé doit être **rotée immédiatement**.
- **Élevé** : le modèle actuel `NEXT_PUBLIC_GEMINI_API_KEY` expose par conception la clé côté navigateur.
- **Élevé** : la CSP Netlify autorise encore `'unsafe-inline'` et `'unsafe-eval'`.
- **Élevé** : plusieurs pages de test existent encore dans l'arbre de routes de production (`/test-db`, `/test-collaboration`, `/test-new-services`, `/test-ui`).
- **Élevé** : des vulnérabilités de dépendances sont présentes (`jspdf`, `next`, chaîne `next-pwa/workbox`).
- **Moyen** : une partie de la protection d'accès reste côté client; la sécurité réelle repose sur Supabase RLS.

### Points positifs
- `.env` et variantes locales sont bien ignorés par Git.
- La clé `SUPABASE_SERVICE_ROLE_KEY` n'est pas utilisée dans le code front applicatif.
- Les tables Supabase inspectées ont RLS activé et des migrations récentes de durcissement existent.

### Backlog prioritaire
1. **Immédiat** : révoquer/rotater la clé Gemini exposée et purger les artefacts statiques générés localement.
2. **Immédiat** : migrer les appels Gemini côté serveur (ex. Netlify Functions) si la fonctionnalité IA doit rester protégée.
3. **Court terme** : retirer ou rendre `dev-only` toutes les pages de test.
4. **Court terme** : resserrer la CSP et supprimer `unsafe-eval`, puis réduire `unsafe-inline`.
5. **Court terme** : mettre à jour les dépendances vulnérables via le gestionnaire de paquets.
6. **Court terme** : réduire les logs applicatifs exposant prompts, profils et détails opérationnels.

---

## 📞 Contacts Équipe

- **Product Owner** : [À définir]
- **Tech Lead** : [À définir]
- **Designer** : [À définir]
- **QA** : [À définir]

---

## 📚 Documentation Technique

### Nouveaux Documents Créés
- `docs/PWA_SETUP.md` - Guide complet PWA
- `docs/IMPLEMENTATION_RGPD_PWA_COLLAB.md` - Détails techniques
- `docs/ROADMAP_PRIORITAIRE.md` - Roadmap priorisée
- `docs/ANALYSE_GLOBALE.md` - Analyse complète de l'application
- `docs/RESUME_FINAL.md` - Résumé des travaux
- `docs/NEW_SERVICES_IMPLEMENTATION.md` - Documentation services Supabase
- `docs/USAGE_NEW_SERVICES.md` - Guide d'utilisation des services
- `docs/FIX_RLS_POLICIES.md` - Guide de correction des politiques RLS

### Pages Créées (Version 1.1-1.3)
- `/check-in` - Check-in hebdomadaire guidé par l'IA
- `/focus` - Focus du jour (3 actions prioritaires)
- `/retrospective` - Rétrospective trimestrielle IA + export PDF
- `/reports` - Rapports et analytics (amélioré)
- `/share` - Vue publique lecture seule
- `/import` - Import CSV/Google Sheets
- `/teams` - Gestion d'équipes avec invitations (v1.3)
- `/test-new-services` - Page de test des services Supabase (v1.3)
- 4 pages légales (`/legal/*`)
- Pages d'authentification (`/auth/*`) : login, register, callback, forgot-password, update-password

### Composants Créés
- `CommentList` - Commentaires avec @mentions
- `CookieBanner` - Bannière de consentement cookies
- `Footer` - Pied de page avec liens légaux (mis à jour)
- `Header` - Navigation avec lien Rétrospective + Menu "Mon Équipe" (v1.3)

### Services Créés (Version 1.3 - Supabase)
- **Services DB** : 9 services Supabase complets
  - `teams.ts` - Gestion d'équipes avec auto-ajout OWNER
  - `teamMembers.ts` - Gestion des membres et rôles
  - `invitations.ts` - Invitations avec tokens
  - `sharedObjectives.ts` - Partages d'objectifs
  - `notifications.ts` - Notifications utilisateur
  - `quarterlyObjectives.ts` - Objectifs trimestriels
  - `quarterlyKeyResults.ts` - KR trimestriels
  - `keyResults.ts` - KR d'ambitions
  - `progress.ts` - Historique de progression
- **Hooks React Query** : 15+ hooks pour toutes les entités
  - `useTeams.ts` - Hooks équipes
  - `useInvitations.ts` - Hooks invitations
  - `useUserNotifications.ts` - Hooks notifications
  - `useSharedObjectives.ts` - Hooks partages
  - `useAmbitions.ts`, `useQuarterlyObjectives.ts`, `useActions.ts`, etc.
- **Services Anciens** (v1.1-1.2)
  - `nudgesService` - Notifications locales intelligentes
  - `shareService` - Partage public avec snapshot Base64
  - `importService` - Import CSV avec mapping automatique
  - `commentService` - Commentaires et mentions

### Fichiers Modifiés Majeurs (Version 1.3)
- `src/lib/supabase.ts` - Client Supabase avec configuration
- `src/store/useAppStore.ts` - Simplifié de 492 à 98 lignes (migration React Query)
- `src/pages/dashboard.tsx` - Migration React Query complète
- `src/pages/management.tsx` - Migration React Query complète
- `src/pages/canvas.tsx` - Migration React Query complète
- `src/pages/actions.tsx` - Migration React Query avec drag & drop
- `src/components/layout/Header.tsx` - Ajout menu "Mon Équipe"
- `package.json` - Version 1.3.7
- `types/index.ts` - Types collaboration et Supabase
- `supabase/schema.sql` - Schéma complet 13 tables
- `supabase/migrations/*` - Migrations SQL (tables manquantes, RLS policies)

---

*Document mis à jour le : 12 Mars 2026*
*Version : 1.3.7*
*Dernières modifications : Audit sécurité, priorisation des remédiations, historique produit et technique*
