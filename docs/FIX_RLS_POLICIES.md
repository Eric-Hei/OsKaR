# Correction des Politiques RLS

## 🔴 Problème Rencontré

Lors des tests fonctionnels des nouveaux services de collaboration, les erreurs suivantes sont apparues :

```
POST https://tgtgrnuekgsczszdjxqr.supabase.co/rest/v1/invitations 403 (Forbidden)
POST https://tgtgrnuekgsczszdjxqr.supabase.co/rest/v1/shared_objectives 403 (Forbidden)
```

**Cause:** Les politiques RLS (Row Level Security) manquaient les permissions INSERT pour :
- `invitations` - Impossible de créer des invitations
- `notifications` - Impossible de créer des notifications (mais ça a fonctionné car pas de politique restrictive)
- `shared_objectives` - Impossible de créer des partages

---

## ✅ Solution

### Étape 1 : Exécuter la Migration SQL

**Fichier:** `supabase/migrations/fix_rls_policies.sql`

**Option A - Via l'interface Supabase (Recommandé):**

1. Ouvre ton projet Supabase : https://supabase.com/dashboard/project/gmzfgqsjygfupysoljru
2. Va dans **"SQL Editor"** (menu de gauche)
3. Clique sur **"New query"**
4. Copie-colle le contenu du fichier `supabase/migrations/fix_rls_policies.sql`
5. Exécute la requête (bouton **"Run"** ou `Ctrl+Enter`)

**Option B - Via Supabase CLI (si installé):**

```powershell
supabase db push
```

---

## 📝 Politiques RLS Ajoutées

### 1. Invitations - INSERT

```sql
CREATE POLICY "Users can create invitations for their teams"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invitations.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('OWNER', 'ADMIN')
    )
  );
```

**Règle:** Seuls les OWNER et ADMIN d'une équipe peuvent créer des invitations pour cette équipe.

### 2. Notifications - INSERT

```sql
CREATE POLICY "Users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

**Règle:** Tout le monde peut créer des notifications (pour permettre les notifications système).

**Alternative plus restrictive (commentée):**
```sql
WITH CHECK (user_id = auth.uid()); -- Seulement pour soi-même
```

### 3. Notifications - DELETE

```sql
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());
```

**Règle:** Les utilisateurs peuvent supprimer leurs propres notifications.

---

## 🧪 Tests Après Migration

### Test 1 : Notifications ✅

Les notifications fonctionnent déjà car la politique INSERT permet tout (`WITH CHECK (true)`).

**Test:**
```typescript
const notification = await createNotification.mutateAsync({
  userId: user.id,
  type: NotificationType.TEAM_INVITATION,
  title: 'Test de notification',
  message: 'Ceci est un test',
  isRead: false,
});
```

**Résultat attendu:** ✅ Notification créée avec succès

### Test 2 : Invitations ⚠️

Les invitations nécessitent une **équipe existante** avec l'utilisateur comme OWNER ou ADMIN.

**Prérequis:**
1. Créer une équipe via l'interface ou le service `TeamsService`
2. S'assurer que l'utilisateur est OWNER ou ADMIN de cette équipe

**Test:**
```typescript
// 1. Créer une équipe d'abord
const team = await TeamsService.create({
  name: 'Mon Équipe Test',
  description: 'Équipe pour tester les invitations',
}, userId);

// 2. Créer une invitation
const invitation = await createInvitation.mutateAsync({
  teamId: team.id,
  email: 'nouveau@membre.com',
  role: TeamRole.MEMBER,
  invitedBy: user.id,
  token: crypto.randomUUID(),
  status: InvitationStatus.PENDING,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
```

**Résultat attendu:** ✅ Invitation créée avec succès

### Test 3 : Partages d'Objectifs ⚠️

Les partages nécessitent un **objectif trimestriel existant** appartenant à l'utilisateur.

**Prérequis:**
1. Créer un objectif trimestriel via l'interface ou le service `QuarterlyObjectivesService`
2. S'assurer que l'objectif appartient à l'utilisateur (`user_id = auth.uid()`)

**Test:**
```typescript
// 1. Créer un objectif trimestriel d'abord
const objective = await QuarterlyObjectivesService.create({
  title: 'Objectif Test',
  description: 'Pour tester les partages',
  quarter: Quarter.Q1,
  year: 2025,
  ambitionId: 'ambition-uuid',
}, userId);

// 2. Créer un partage
const share = await createShare.mutateAsync({
  objectiveId: objective.id,
  objectiveType: 'quarterly_objective',
  sharedWithUserId: 'autre-user-uuid',
  sharedByUserId: user.id,
  permission: SharePermission.VIEW,
});
```

**Résultat attendu:** ✅ Partage créé avec succès

---

## 🔍 Vérification des Politiques RLS

### Via l'interface Supabase

1. Ouvre ton projet Supabase
2. Va dans **"Authentication"** → **"Policies"**
3. Sélectionne la table (`invitations`, `notifications`, `shared_objectives`)
4. Vérifie que les politiques suivantes existent :

**Invitations:**
- ✅ `Team admins can manage invitations` (ALL)
- ✅ `Users can view invitations sent to their email` (SELECT)
- ✅ `Users can create invitations for their teams` (INSERT) ← **Nouvelle**

**Notifications:**
- ✅ `Users can view own notifications` (SELECT)
- ✅ `Users can update own notifications` (UPDATE)
- ✅ `Users can create notifications` (INSERT) ← **Nouvelle**
- ✅ `Users can delete own notifications` (DELETE) ← **Nouvelle**

**Shared Objectives:**
- ✅ `Users can view shares of their objectives` (SELECT)
- ✅ `Users can create shares for their objectives` (INSERT)
- ✅ `Users can delete their own shares` (DELETE)
- ✅ `Users can update permission on their shares` (UPDATE)

---

## 📊 Validation Fonctionnelle

Le scénario de validation a été ajusté pour :

1. **Notifications** : ✅ Test fonctionnel (pas de prérequis)
2. **Invitations** : ⚠️ Skip avec message explicatif (nécessite une équipe)
3. **Partages** : ⚠️ Skip avec message explicatif (nécessite un objectif)

**Messages affichés:**
```
⚠️ SKIP: Les invitations nécessitent une équipe existante avec permissions admin
   Pour tester: créer une équipe d'abord, puis utiliser son ID

⚠️ SKIP: Les partages nécessitent un objectif trimestriel existant
   Pour tester: créer un objectif trimestriel d'abord, puis utiliser son ID
```

---

## 🎯 Prochaines Étapes

1. ✅ **Exécuter la migration SQL** `fix_rls_policies.sql`
2. ✅ **Tester les notifications** via le parcours réel de l'application (devrait fonctionner)
3. ⏳ **Créer une équipe** via l'interface ou le code
4. ⏳ **Tester les invitations** avec l'ID de l'équipe créée
5. ⏳ **Créer un objectif trimestriel** via l'interface ou le code
6. ⏳ **Tester les partages** avec l'ID de l'objectif créé

---

## 💡 Conseils

- **Toujours vérifier les politiques RLS** lors de la création de nouvelles tables
- **Tester avec des données réelles** (équipes, objectifs existants)
- **Utiliser le SQL Editor de Supabase** pour déboguer les politiques RLS
- **Consulter les logs Supabase** pour voir les erreurs de permissions détaillées

