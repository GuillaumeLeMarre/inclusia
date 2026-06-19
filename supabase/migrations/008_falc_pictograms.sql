-- Pictogrammes FALC (ARASAAC) associés à une adaptation

ALTER TABLE adaptations
  ADD COLUMN IF NOT EXISTS falc_pictograms JSONB DEFAULT NULL;

COMMENT ON COLUMN adaptations.falc_pictograms IS 'Pictogrammes ARASAAC : { items, generatedAt, locale }';
COMMENT ON COLUMN adaptations.generate_pictograms IS 'Générer des pictogrammes ARASAAC pour le support';
