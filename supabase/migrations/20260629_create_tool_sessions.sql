-- Boîte à outils collaborative — sessions partagées (Planning Poker, etc.)
-- Modèle « Option A » : on rejoint une session via un lien + un prénom, SANS compte OsKaR.
-- Le code de session (ex: « POKER-7K2P ») fait office de jeton d'accès partagé.
-- L'état temps réel transite par Supabase Realtime (Broadcast/Presence) ; cette table
-- ne sert qu'à persister un INSTANTANÉ pour les retardataires / rafraîchissements de page,
-- et à appliquer la rétention (expires_at).
-- Migration idempotente : peut être ré-exécutée intégralement sans erreur.
-- ⚠️ Exécuter TOUT le fichier d'un seul bloc (ne pas sélectionner une portion).

CREATE TABLE IF NOT EXISTS tool_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Code partagé unique (en MAJUSCULES), ex: « POKER-7K2P »
  code TEXT NOT NULL UNIQUE,
  -- Type d'outil (= tool_type côté app / canal Realtime), ex: « planning-poker »
  tool_type TEXT NOT NULL,
  -- Identifiant client de l'hôte/facilitateur (clientId local, PAS un auth.uid)
  host_id TEXT,
  -- Instantané de l'état métier (votes, story, suite, chrono…)
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Expiration (rétention paramétrée côté application : TOOLBOX_CONFIG.sessionRetentionHours)
  expires_at TIMESTAMPTZ NOT NULL
);

-- Récupération rapide par code (jeton d'accès)
CREATE INDEX IF NOT EXISTS idx_tool_sessions_code ON tool_sessions(code);
-- Purge des sessions expirées
CREATE INDEX IF NOT EXISTS idx_tool_sessions_expires ON tool_sessions(expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — Option A (accès par jeton/code, sans compte).
-- Les sessions sont éphémères et non sensibles (votes d'atelier). Le code aléatoire
-- joue le rôle de secret : on autorise anon + authenticated à lire/créer/mettre à jour,
-- mais JAMAIS à supprimer (la purge passe par la fonction SECURITY DEFINER ci-dessous).
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;

-- Lecture : toute personne disposant du code peut filtrer dessus.
DROP POLICY IF EXISTS "Anyone can read tool sessions" ON tool_sessions;
CREATE POLICY "Anyone can read tool sessions"
  ON tool_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Création : n'importe qui peut créer une session (le facilitateur).
DROP POLICY IF EXISTS "Anyone can create tool sessions" ON tool_sessions;
CREATE POLICY "Anyone can create tool sessions"
  ON tool_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Mise à jour : tout participant met à jour l'instantané d'état partagé.
DROP POLICY IF EXISTS "Anyone can update tool sessions" ON tool_sessions;
CREATE POLICY "Anyone can update tool sessions"
  ON tool_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- (Pas de policy DELETE : suppression réservée à la fonction de purge SECURITY DEFINER.)

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at automatique à chaque écriture
CREATE OR REPLACE FUNCTION set_tool_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tool_sessions_updated_at ON tool_sessions;
CREATE TRIGGER trg_tool_sessions_updated_at
  BEFORE UPDATE ON tool_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_tool_sessions_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Purge des sessions expirées (rétention). Appelable par l'app (anon/authenticated)
-- de façon opportuniste, ou planifiable via pg_cron si disponible.
--
-- ⚠️ Pour l'outil « En mode récré ! », les photos vivent dans le bucket Storage
-- « recre-photos » : supprimer la ligne tool_sessions NE supprime PAS les fichiers.
-- Une suppression directe via SQL (DELETE FROM storage.objects) laisserait des
-- fichiers ORPHELINS dans le backend S3. La seule méthode fiable est d'appeler
-- l'API Storage REST (HTTP DELETE), ce que fait cette fonction via l'extension
-- « http » + une clé service lue dans Vault (jamais en clair dans le dépôt).
--
-- Configuration unique requise (côté Supabase, hors dépôt) pour activer la purge
-- des photos — sans elle, seules les lignes tool_sessions sont purgées :
--   create extension if not exists http with schema extensions;
--   create extension if not exists supabase_vault;
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
CREATE OR REPLACE FUNCTION cleanup_expired_tool_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_project_url text;
  v_service_key text;
  v_session     record;
  v_obj         record;
  v_status      int;
BEGIN
  -- Secrets lus depuis Vault (NULL si non configuré → purge Storage ignorée).
  BEGIN
    SELECT decrypted_secret INTO v_project_url
      FROM vault.decrypted_secrets WHERE name = 'project_url';
    SELECT decrypted_secret INTO v_service_key
      FROM vault.decrypted_secrets WHERE name = 'service_role_key';
  EXCEPTION WHEN OTHERS THEN
    v_project_url := NULL;
    v_service_key := NULL;
  END;

  -- Purge des fichiers Storage des sessions « En mode récré ! » expirées,
  -- uniquement si Vault + extension http sont disponibles.
  IF v_project_url IS NOT NULL AND v_service_key IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    FOR v_session IN
      SELECT code FROM tool_sessions
      WHERE expires_at < NOW() AND tool_type = 'en-mode-recre'
    LOOP
      -- Photos rangées par préfixe « CODE/… » (cf. recreStorage.ts). Les noms
      -- ne contiennent que des caractères sûrs en URL → pas d'encodage requis.
      FOR v_obj IN
        SELECT name FROM storage.objects
        WHERE bucket_id = 'recre-photos'
          AND name LIKE v_session.code || '/%'
      LOOP
        BEGIN
          SELECT status INTO v_status FROM extensions.http((
            'DELETE',
            rtrim(v_project_url, '/') || '/storage/v1/object/recre-photos/' || v_obj.name,
            ARRAY[
              extensions.http_header('apikey', v_service_key),
              extensions.http_header('Authorization', 'Bearer ' || v_service_key)
            ],
            NULL,
            NULL
          )::extensions.http_request);
        EXCEPTION WHEN OTHERS THEN
          -- Échec ponctuel (réseau, objet déjà absent) : on continue la purge.
          NULL;
        END;
      END LOOP;
    END LOOP;
  END IF;

  -- Purge des instantanés expirés (tous outils confondus).
  DELETE FROM tool_sessions WHERE expires_at < NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_expired_tool_sessions() TO anon, authenticated;

-- Planification quotidienne si l'extension pg_cron est disponible (sinon, ignoré).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-expired-tool-sessions',
      '0 3 * * *',
      $cron$ SELECT cleanup_expired_tool_sessions(); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Pas de pg_cron / droits insuffisants : la purge restera opportuniste côté app.
  NULL;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Activer Realtime (Broadcast/Presence n'en dépendent pas, mais on publie la table
-- pour permettre un éventuel suivi des changements Postgres si besoin plus tard).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tool_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tool_sessions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;
