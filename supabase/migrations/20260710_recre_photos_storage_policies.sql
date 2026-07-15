-- ─────────────────────────────────────────────────────────────────────────────
-- Storage « en mode récré » : bucket recre-photos
--
-- Contexte : l'upload des photos sur un board récré échouait avec
-- « new row violates row-level security policy » car aucune policy INSERT
-- n'existait sur storage.objects pour ce bucket.
--
-- Modèle d'accès retenu :
--  - bucket PUBLIC : les photos sont lues via les URLs publiques
--    (/storage/v1/object/public/recre-photos/...), qui ne passent pas par RLS ;
--  - INSERT autorisé aux invités (anon) et connectés (authenticated), car les
--    participants d'un board partagé par code ne sont pas authentifiés ;
--  - PAS de policy SELECT sur storage.objects : elle permettrait de lister
--    tous les fichiers du bucket via l'API (avertissement Supabase
--    « Clients can list all files in this bucket »).
-- ─────────────────────────────────────────────────────────────────────────────

-- Créer le bucket s'il n'existe pas (public pour la lecture par URL directe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recre-photos', 'recre-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Upload : invités et utilisateurs connectés
DROP POLICY IF EXISTS "recre photos upload" ON storage.objects;
CREATE POLICY "recre photos upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'recre-photos');

-- Écrasement : l'upload utilise upsert=true (recreStorage.uploadRecrePhoto)
DROP POLICY IF EXISTS "recre photos update" ON storage.objects;
CREATE POLICY "recre photos update"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'recre-photos')
  WITH CHECK (bucket_id = 'recre-photos');

-- Suppression : nécessaire pour deleteRecrePhoto (retrait d'une photo du board)
DROP POLICY IF EXISTS "recre photos delete" ON storage.objects;
CREATE POLICY "recre photos delete"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'recre-photos');

-- Supprimer la policy SELECT trop large (listing complet du bucket possible).
-- La lecture des photos passe par les URLs publiques du bucket.
-- ⚠️ Si l'app utilise storage.list() pour afficher les photos d'un board,
-- il faudra réintroduire une policy SELECT adaptée.
DROP POLICY IF EXISTS "recre photos read" ON storage.objects;
