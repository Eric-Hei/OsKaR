-- Boîte à outils — outil « En mode récré ! » : stockage des photos partagées.
-- Modèle « Option A » (sans compte) : on dépose des photos dans une session
-- éphémère. Pour ne PAS surcharger l'état Realtime (broadcast/snapshot), les
-- images sont stockées dans un bucket Storage public ; seules leurs URLs
-- transitent dans l'état partagé. Le code de session sert de jeton d'accès.
-- Migration idempotente : peut être ré-exécutée intégralement sans erreur.
-- ⚠️ Exécuter TOUT le fichier d'un seul bloc (ne pas sélectionner une portion).

-- Bucket public dédié (lecture via URL publique), limité à 5 Mo / image.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recre-photos',
  'recre-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS sur storage.objects : accès restreint au bucket « recre-photos ».
-- Les sessions sont éphémères et non sensibles (photos d'atelier) ; le code
-- aléatoire (préfixe de chemin) joue le rôle de secret partagé.
--
-- ⚠️ PAS de policy SELECT : le bucket est public, donc les photos sont servies
-- via leur URL publique (l'app n'utilise que upload() + getPublicUrl(), jamais
-- list()). Une policy SELECT permettrait à n'importe qui d'ÉNUMÉRER tous les
-- fichiers de toutes les sessions — d'où l'alerte Supabase. On la retire donc,
-- au cas où elle aurait été créée par une version antérieure de cette migration.
DROP POLICY IF EXISTS "recre photos read" ON storage.objects;

-- Dépôt : n'importe quel participant peut téléverser une photo.
DROP POLICY IF EXISTS "recre photos insert" ON storage.objects;
CREATE POLICY "recre photos insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'recre-photos');

-- Mise à jour (upsert sur un même chemin).
DROP POLICY IF EXISTS "recre photos update" ON storage.objects;
CREATE POLICY "recre photos update"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'recre-photos')
  WITH CHECK (bucket_id = 'recre-photos');
