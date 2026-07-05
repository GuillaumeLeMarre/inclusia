-- Dimensions pédagogiques en colonnes JSONB distinctes (8 sections)
-- Inclut les prérequis de 010 si cette migration n'a pas encore été appliquée.

-- ── Prérequis (ex-010) ──────────────────────────────────────────────────────

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

-- ── Colonnes dimensions (8 sections) ────────────────────────────────────────

ALTER TABLE pedagogical_profiles
  ADD COLUMN IF NOT EXISTS pedagogical_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS linguistic_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS layout_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS structuring_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visual_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audio_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exercise_adaptations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evaluation_rules JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE pedagogical_profile_versions
  ADD COLUMN IF NOT EXISTS pedagogical_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS linguistic_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS layout_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS structuring_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visual_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audio_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exercise_adaptations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evaluation_rules JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS custom_pedagogical_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_linguistic_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_layout_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_structuring_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_visual_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_audio_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_exercise_adaptations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_evaluation_rules JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE teacher_profile_versions
  ADD COLUMN IF NOT EXISTS custom_pedagogical_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_linguistic_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_layout_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_structuring_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_visual_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_audio_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_exercise_adaptations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_evaluation_rules JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── Backfill depuis pedagogical_strategy / custom_strategy ─────────────────

UPDATE pedagogical_profiles SET
  pedagogical_objectives = COALESCE(pedagogical_strategy->'objectives', '[]'::jsonb),
  linguistic_rules = COALESCE(pedagogical_strategy->'linguistic_rules', '[]'::jsonb),
  layout_rules = COALESCE(pedagogical_strategy->'layout_rules', '[]'::jsonb),
  structuring_rules = COALESCE(pedagogical_strategy->'structure_rules', '[]'::jsonb),
  visual_aids = COALESCE(pedagogical_strategy->'visual_aids', '[]'::jsonb),
  audio_aids = COALESCE(pedagogical_strategy->'audio_aids', '[]'::jsonb),
  exercise_adaptations = COALESCE(pedagogical_strategy->'exercise_adaptations', '[]'::jsonb),
  evaluation_rules = COALESCE(pedagogical_strategy->'evaluation_rules', '[]'::jsonb)
WHERE pedagogical_strategy IS NOT NULL
  AND pedagogical_strategy <> '{}'::jsonb
  AND jsonb_array_length(COALESCE(pedagogical_strategy->'objectives', '[]'::jsonb))
    + jsonb_array_length(COALESCE(pedagogical_strategy->'linguistic_rules', '[]'::jsonb)) > 0;

UPDATE pedagogical_profile_versions SET
  pedagogical_objectives = COALESCE(pedagogical_strategy->'objectives', '[]'::jsonb),
  linguistic_rules = COALESCE(pedagogical_strategy->'linguistic_rules', '[]'::jsonb),
  layout_rules = COALESCE(pedagogical_strategy->'layout_rules', '[]'::jsonb),
  structuring_rules = COALESCE(pedagogical_strategy->'structure_rules', '[]'::jsonb),
  visual_aids = COALESCE(pedagogical_strategy->'visual_aids', '[]'::jsonb),
  audio_aids = COALESCE(pedagogical_strategy->'audio_aids', '[]'::jsonb),
  exercise_adaptations = COALESCE(pedagogical_strategy->'exercise_adaptations', '[]'::jsonb),
  evaluation_rules = COALESCE(pedagogical_strategy->'evaluation_rules', '[]'::jsonb)
WHERE pedagogical_strategy IS NOT NULL
  AND pedagogical_strategy <> '{}'::jsonb;

UPDATE teacher_profiles SET
  custom_pedagogical_objectives = COALESCE(custom_strategy->'objectives', '[]'::jsonb),
  custom_linguistic_rules = COALESCE(custom_strategy->'linguistic_rules', '[]'::jsonb),
  custom_layout_rules = COALESCE(custom_strategy->'layout_rules', '[]'::jsonb),
  custom_structuring_rules = COALESCE(custom_strategy->'structure_rules', '[]'::jsonb),
  custom_visual_aids = COALESCE(custom_strategy->'visual_aids', '[]'::jsonb),
  custom_audio_aids = COALESCE(custom_strategy->'audio_aids', '[]'::jsonb),
  custom_exercise_adaptations = COALESCE(custom_strategy->'exercise_adaptations', '[]'::jsonb),
  custom_evaluation_rules = COALESCE(custom_strategy->'evaluation_rules', '[]'::jsonb)
WHERE custom_strategy IS NOT NULL
  AND custom_strategy <> '{}'::jsonb;

UPDATE teacher_profile_versions SET
  custom_pedagogical_objectives = COALESCE(custom_strategy->'objectives', '[]'::jsonb),
  custom_linguistic_rules = COALESCE(custom_strategy->'linguistic_rules', '[]'::jsonb),
  custom_layout_rules = COALESCE(custom_strategy->'layout_rules', '[]'::jsonb),
  custom_structuring_rules = COALESCE(custom_strategy->'structure_rules', '[]'::jsonb),
  custom_visual_aids = COALESCE(custom_strategy->'visual_aids', '[]'::jsonb),
  custom_audio_aids = COALESCE(custom_strategy->'audio_aids', '[]'::jsonb),
  custom_exercise_adaptations = COALESCE(custom_strategy->'exercise_adaptations', '[]'::jsonb),
  custom_evaluation_rules = COALESCE(custom_strategy->'evaluation_rules', '[]'::jsonb)
WHERE custom_strategy IS NOT NULL
  AND custom_strategy <> '{}'::jsonb;
