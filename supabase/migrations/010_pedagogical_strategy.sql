-- Stratégie pédagogique structurée + score qualité adaptation

ALTER TABLE pedagogical_profiles
  ADD COLUMN IF NOT EXISTS pedagogical_strategy JSONB NOT NULL DEFAULT '{
    "objectives": [],
    "linguistic_rules": [],
    "layout_rules": [],
    "structure_rules": [],
    "visual_aids": [],
    "audio_aids": [],
    "exercise_adaptations": [],
    "evaluation_rules": [],
    "avoid": []
  }'::jsonb;

ALTER TABLE pedagogical_profile_versions
  ADD COLUMN IF NOT EXISTS pedagogical_strategy JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS custom_strategy JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE teacher_profile_versions
  ADD COLUMN IF NOT EXISTS custom_strategy JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE adaptations
  ADD COLUMN IF NOT EXISTS adaptation_quality_score INT
    CHECK (adaptation_quality_score IS NULL OR adaptation_quality_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS pedagogical_profile_slugs JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_adaptations_quality_score
  ON adaptations(adaptation_quality_score)
  WHERE adaptation_quality_score IS NOT NULL;
