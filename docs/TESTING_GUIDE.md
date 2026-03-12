# Guide de Test - OsKaR v2.0

## Principe

Les anciennes routes de test dédiées ont été retirées de la production.

Les vérifications fonctionnelles doivent maintenant se faire via les parcours réels de l'application.

## 1. Authentification

### Parcours
1. ouvrir `/auth/login`
2. se connecter
3. vérifier la redirection vers `/dashboard`
4. recharger la page
5. vérifier que la session reste cohérente
6. se déconnecter
7. vérifier le retour vers `/auth/login`

### Points de contrôle
- pas de boucle de refresh
- pas de session fantôme après reload
- pas de duplication d'état entre store et Supabase Auth

## 2. Parcours OKR principal

### Canvas (`/canvas`)
- créer une ambition
- ajouter des key results
- créer un objectif trimestriel
- créer des actions
- vérifier la sauvegarde

### Management (`/management`)
- ouvrir la vue hiérarchique
- ouvrir la vue Kanban
- modifier le statut d'une action
- supprimer une entité
- vérifier la cohérence après refresh

### Dashboard (`/dashboard`)
- vérifier l'affichage des métriques
- vérifier la liste des ambitions
- vérifier la navigation croisée vers les vues de gestion

## 3. Parcours collaboration

### Teams (`/teams`)
- créer une équipe
- vérifier l'affichage des membres
- créer une invitation
- vérifier les notifications associées si le scénario s'applique

### Invitations
- ouvrir un lien d'invitation valide si disponible
- vérifier les états acceptée / refusée / expirée selon le cas

## 4. Parcours IA

### Pré-requis
- `GEMINI_API_KEY` configuré côté serveur pour les tests réels

### Vérifications
- ambition : conseils générés ou fallback propre
- key result : conseils générés ou fallback propre
- profil d'entreprise : questions générées
- rétrospective : texte généré sans fuite d'erreur technique brute

## 5. Robustesse

### Réseau lent
1. activer `Slow 3G` dans DevTools
2. refaire une action de création
3. vérifier un message d'erreur exploitable si timeout

### Double clic / idempotence
1. double-cliquer rapidement sur une création
2. vérifier l'absence de doublon en base

### Recharge après action
1. créer / modifier une entité
2. recharger la page
3. vérifier la cohérence des données

## 6. Vérifications Supabase

Contrôler dans le dashboard Supabase :
- `profiles`
- `ambitions`
- `quarterly_objectives`
- `quarterly_key_results`
- `actions`
- `teams`
- `team_members`
- `invitations`
- `notifications`
- `shared_objectives`

Points de contrôle :
- les lignes appartiennent bien à l'utilisateur courant
- les RLS empêchent les accès croisés non autorisés
- aucune donnée de test inutile n'est exposée via une route dédiée

## 7. Checklist finale

- [ ] login / logout OK
- [ ] reload de session OK
- [ ] création d'ambition OK
- [ ] création d'objectif trimestriel OK
- [ ] création d'action OK
- [ ] parcours équipe / invitation OK
- [ ] conseils IA ou fallback OK
- [ ] données cohérentes dans Supabase
- [ ] aucune route de test exposée

**Date :** 12 Mars 2026  
**Version :** OsKaR v2.0 (Supabase + React Query + sécurité durcie)

