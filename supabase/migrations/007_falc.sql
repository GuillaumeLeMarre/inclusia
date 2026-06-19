-- Module FALC : niveau d'adaptation et métriques qualité

ALTER TABLE adaptations
  ADD COLUMN IF NOT EXISTS adaptation_level TEXT NOT NULL DEFAULT 'standard'
    CHECK (adaptation_level IN ('standard', 'simplified', 'falc')),
  ADD COLUMN IF NOT EXISTS falc_score INTEGER CHECK (falc_score IS NULL OR (falc_score >= 0 AND falc_score <= 100)),
  ADD COLUMN IF NOT EXISTS falc_content TEXT,
  ADD COLUMN IF NOT EXISTS generate_pictograms BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN adaptations.adaptation_level IS 'standard | simplified | falc';
COMMENT ON COLUMN adaptations.falc_score IS 'Score qualité FALC sur 100';
COMMENT ON COLUMN adaptations.falc_content IS 'Contenu adapté en FALC';
COMMENT ON COLUMN adaptations.generate_pictograms IS 'Placeholder V2 pictogrammes';

INSERT INTO adaptation_profiles (slug, name, description, category, sort_order)
VALUES (
  'falc',
  'FALC',
  'Facile à Lire et à Comprendre — phrases courtes, vocabulaire simple',
  'accessibility',
  14
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;
