-- Options de production par adaptation + synchronisation stratégie / dimensions
-- Aligné avec le wizard d'adaptation et les profils à prompt auto-généré.

-- ── Adaptations : choix wizard (résumé, quiz, schéma, audio, FALC) ───────────

ALTER TABLE adaptations
  ADD COLUMN IF NOT EXISTS production_options JSONB NOT NULL DEFAULT '{
    "generate_summary": true,
    "generate_quiz": true,
    "generate_mindmap": true,
    "generate_audio": false,
    "generate_falc": false
  }'::jsonb;

COMMENT ON COLUMN adaptations.production_options IS
  'Contenus à générer choisis lors de l''adaptation (wizard).';

COMMENT ON COLUMN adaptations.adaptation_level IS
  'Niveau d''adaptation choisi lors de l''adaptation (standard, simplified, falc).';

-- ── Documentation sémantique profils ─────────────────────────────────────────

COMMENT ON COLUMN pedagogical_profiles.system_prompt IS
  'Prompt système générique (auto-généré). La personnalisation vient des 8 dimensions.';

COMMENT ON COLUMN pedagogical_profiles.user_prompt IS
  'Legacy — le moteur IA construit le prompt utilisateur dynamiquement.';

COMMENT ON COLUMN pedagogical_profiles.options IS
  'Valeurs par défaut legacy. Les choix effectifs sont dans adaptations.production_options.';

COMMENT ON COLUMN pedagogical_profiles.adaptation_level IS
  'Niveau par défaut legacy. Le niveau effectif est sur adaptations.adaptation_level.';

COMMENT ON COLUMN teacher_profiles.options IS
  'Valeurs par défaut legacy. Les choix effectifs sont dans adaptations.production_options.';

COMMENT ON COLUMN teacher_profiles.custom_prompt IS
  'Legacy optionnel — préférer les dimensions custom_* pour la personnalisation.';

-- ── Resynchroniser pedagogical_strategy depuis les colonnes dimensions ───────

UPDATE pedagogical_profiles SET
  pedagogical_strategy = jsonb_build_object(
    'objectives', COALESCE(pedagogical_objectives, '[]'::jsonb),
    'linguistic_rules', COALESCE(linguistic_rules, '[]'::jsonb),
    'layout_rules', COALESCE(layout_rules, '[]'::jsonb),
    'structure_rules', COALESCE(structuring_rules, '[]'::jsonb),
    'visual_aids', COALESCE(visual_aids, '[]'::jsonb),
    'audio_aids', COALESCE(audio_aids, '[]'::jsonb),
    'exercise_adaptations', COALESCE(exercise_adaptations, '[]'::jsonb),
    'evaluation_rules', COALESCE(evaluation_rules, '[]'::jsonb),
    'avoid', COALESCE(pedagogical_strategy->'avoid', '[]'::jsonb)
  );

UPDATE pedagogical_profile_versions SET
  pedagogical_strategy = jsonb_build_object(
    'objectives', COALESCE(pedagogical_objectives, '[]'::jsonb),
    'linguistic_rules', COALESCE(linguistic_rules, '[]'::jsonb),
    'layout_rules', COALESCE(layout_rules, '[]'::jsonb),
    'structure_rules', COALESCE(structuring_rules, '[]'::jsonb),
    'visual_aids', COALESCE(visual_aids, '[]'::jsonb),
    'audio_aids', COALESCE(audio_aids, '[]'::jsonb),
    'exercise_adaptations', COALESCE(exercise_adaptations, '[]'::jsonb),
    'evaluation_rules', COALESCE(evaluation_rules, '[]'::jsonb),
    'avoid', COALESCE(pedagogical_strategy->'avoid', '[]'::jsonb)
  );

UPDATE teacher_profiles SET
  custom_strategy = jsonb_build_object(
    'objectives', COALESCE(custom_pedagogical_objectives, '[]'::jsonb),
    'linguistic_rules', COALESCE(custom_linguistic_rules, '[]'::jsonb),
    'layout_rules', COALESCE(custom_layout_rules, '[]'::jsonb),
    'structure_rules', COALESCE(custom_structuring_rules, '[]'::jsonb),
    'visual_aids', COALESCE(custom_visual_aids, '[]'::jsonb),
    'audio_aids', COALESCE(custom_audio_aids, '[]'::jsonb),
    'exercise_adaptations', COALESCE(custom_exercise_adaptations, '[]'::jsonb),
    'evaluation_rules', COALESCE(custom_evaluation_rules, '[]'::jsonb),
    'avoid', COALESCE(custom_strategy->'avoid', '[]'::jsonb)
  );

UPDATE teacher_profile_versions SET
  custom_strategy = jsonb_build_object(
    'objectives', COALESCE(custom_pedagogical_objectives, '[]'::jsonb),
    'linguistic_rules', COALESCE(custom_linguistic_rules, '[]'::jsonb),
    'layout_rules', COALESCE(custom_layout_rules, '[]'::jsonb),
    'structure_rules', COALESCE(custom_structuring_rules, '[]'::jsonb),
    'visual_aids', COALESCE(custom_visual_aids, '[]'::jsonb),
    'audio_aids', COALESCE(custom_audio_aids, '[]'::jsonb),
    'exercise_adaptations', COALESCE(custom_exercise_adaptations, '[]'::jsonb),
    'evaluation_rules', COALESCE(custom_evaluation_rules, '[]'::jsonb),
    'avoid', COALESCE(custom_strategy->'avoid', '[]'::jsonb)
  );
