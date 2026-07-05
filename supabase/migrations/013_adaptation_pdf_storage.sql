-- INCLUSIA - Stockage PDF des adaptations générées

ALTER TABLE adaptations
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;

COMMENT ON COLUMN adaptations.pdf_storage_path IS
  'Chemin Storage du PDF généré (bucket adaptations), ex. {teacher_id}/{adaptation_id}.pdf';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adaptations',
  'adaptations',
  false,
  20971520,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Enseignants uploadent leurs PDF d'adaptation"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adaptations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Enseignants lisent leurs PDF d'adaptation"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'adaptations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Enseignants suppriment leurs PDF d'adaptation"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adaptations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Enseignants mettent à jour leurs PDF d'adaptation"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adaptations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
