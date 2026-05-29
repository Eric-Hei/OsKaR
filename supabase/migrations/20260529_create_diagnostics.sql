-- Create diagnostics table (résultats du bilan de maturité OSKAR)
-- Stocke le diagnostic d'un utilisateur connecté (user_id) ou d'un invité (email seul).
-- Migration idempotente : peut être ré-exécutée intégralement sans erreur.
-- ⚠️ Exécuter TOUT le fichier d'un seul bloc (ne pas sélectionner une portion).
CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un diagnostic est rattaché soit à un compte, soit à un email d'invité
  CONSTRAINT diagnostics_owner_check CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- Index pour récupérer rapidement les diagnostics d'un utilisateur (du plus récent au plus ancien)
CREATE INDEX IF NOT EXISTS idx_diagnostics_user ON diagnostics(user_id, created_at DESC);

-- RLS Policies pour diagnostics
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Lecture: l'utilisateur connecté ne voit que ses propres diagnostics
DROP POLICY IF EXISTS "Users can view their own diagnostics" ON diagnostics;
CREATE POLICY "Users can view their own diagnostics"
  ON diagnostics FOR SELECT
  USING (user_id = auth.uid());

-- Création: un utilisateur connecté crée pour lui-même, un invité crée un diagnostic sans user_id
DROP POLICY IF EXISTS "Users and guests can create diagnostics" ON diagnostics;
CREATE POLICY "Users and guests can create diagnostics"
  ON diagnostics FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Mise à jour: seul le propriétaire connecté peut modifier
DROP POLICY IF EXISTS "Users can update their own diagnostics" ON diagnostics;
CREATE POLICY "Users can update their own diagnostics"
  ON diagnostics FOR UPDATE
  USING (user_id = auth.uid());

-- Suppression: seul le propriétaire connecté peut supprimer
DROP POLICY IF EXISTS "Users can delete their own diagnostics" ON diagnostics;
CREATE POLICY "Users can delete their own diagnostics"
  ON diagnostics FOR DELETE
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Restauration d'un bilan par email (modèle invité, sans compte).
-- La policy SELECT (user_id = auth.uid()) bloque toute lecture anonyme : on passe
-- par une fonction SECURITY DEFINER qui renvoie le dernier bilan d'un email donné.
-- ⚠️ Volontairement simple (pas de vérification d'email) : conforme au besoin produit.
CREATE OR REPLACE FUNCTION get_latest_diagnostic_by_email(p_email TEXT)
RETURNS SETOF diagnostics
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM diagnostics
  WHERE email = p_email
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Autoriser invités (anon) et utilisateurs connectés à appeler la fonction
GRANT EXECUTE ON FUNCTION get_latest_diagnostic_by_email(TEXT) TO anon, authenticated;
