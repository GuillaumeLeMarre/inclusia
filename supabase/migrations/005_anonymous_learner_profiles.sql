-- Migration : profils d'adaptation anonymes (sans données nominatives)

-- Nouvelles colonnes sur students
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS approximate_level TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS adaptation_slugs JSONB;
ALTER TABLE students ADD COLUMN IF NOT EXISTS pedagogical_needs TEXT;

-- Anonymiser les données existantes (toutes les lignes)
UPDATE students SET
  profile_name = COALESCE(
    NULLIF(TRIM(profile_name), ''),
    'Profil ' || LEFT(id::text, 8)
  ),
  approximate_level = COALESCE(approximate_level, grade_level),
  adaptation_slugs = COALESCE(adaptation_slugs, profiles, '[]'::jsonb),
  pedagogical_needs = COALESCE(pedagogical_needs, needs);

ALTER TABLE students ALTER COLUMN profile_name SET NOT NULL;
ALTER TABLE students ALTER COLUMN adaptation_slugs SET NOT NULL;
ALTER TABLE students ALTER COLUMN adaptation_slugs SET DEFAULT '[]';

-- Supprimer les colonnes nominatives
ALTER TABLE students DROP COLUMN IF EXISTS first_name;
ALTER TABLE students DROP COLUMN IF EXISTS last_name;
ALTER TABLE students DROP COLUMN IF EXISTS class_name;
ALTER TABLE students DROP COLUMN IF EXISTS grade_level;
ALTER TABLE students DROP COLUMN IF EXISTS profiles;
ALTER TABLE students DROP COLUMN IF EXISTS needs;

-- Renommer la table
ALTER TABLE students RENAME TO learner_profiles;

-- Renommer les clés étrangères
ALTER TABLE learning_preferences RENAME COLUMN student_id TO profile_id;
ALTER TABLE adaptations RENAME COLUMN student_id TO profile_id;
ALTER TABLE feedbacks RENAME COLUMN student_id TO profile_id;

-- Index
DROP INDEX IF EXISTS idx_students_teacher;
CREATE INDEX IF NOT EXISTS idx_learner_profiles_teacher ON learner_profiles(teacher_id);

DROP INDEX IF EXISTS idx_adaptations_student;
CREATE INDEX IF NOT EXISTS idx_adaptations_profile ON adaptations(profile_id);

-- Trigger préférences par défaut
DROP TRIGGER IF EXISTS on_student_created ON learner_profiles;
DROP FUNCTION IF EXISTS handle_new_student();

CREATE OR REPLACE FUNCTION handle_new_learner_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO learning_preferences (profile_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_learner_profile_created
  AFTER INSERT ON learner_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_learner_profile();

-- RLS : learner_profiles
DROP POLICY IF EXISTS "Enseignants voient leurs élèves" ON learner_profiles;
DROP POLICY IF EXISTS "Enseignants créent leurs élèves" ON learner_profiles;
DROP POLICY IF EXISTS "Enseignants modifient leurs élèves" ON learner_profiles;
DROP POLICY IF EXISTS "Enseignants suppriment leurs élèves" ON learner_profiles;

CREATE POLICY "Enseignants voient leurs profils"
  ON learner_profiles FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR is_admin()
    OR (is_school_admin() AND school_id = current_teacher_school_id())
  );

CREATE POLICY "Enseignants créent leurs profils"
  ON learner_profiles FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Enseignants modifient leurs profils"
  ON learner_profiles FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Enseignants suppriment leurs profils"
  ON learner_profiles FOR DELETE
  USING (teacher_id = auth.uid());

-- RLS : learning_preferences
DROP POLICY IF EXISTS "Accès préférences via élève" ON learning_preferences;

CREATE POLICY "Accès préférences via profil"
  ON learning_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM learner_profiles lp
      WHERE lp.id = learning_preferences.profile_id
        AND (lp.teacher_id = auth.uid() OR is_admin())
    )
  );

COMMENT ON TABLE learner_profiles IS 'Profils d''adaptation anonymes (sans données nominatives)';
COMMENT ON COLUMN learner_profiles.profile_name IS 'Libellé du profil (ex. CM2 - lecture simplifiée)';
COMMENT ON COLUMN learner_profiles.approximate_level IS 'Niveau scolaire approximatif';
COMMENT ON COLUMN learner_profiles.adaptation_slugs IS 'Types d''adaptation (dyslexie, TDAH, etc.)';
COMMENT ON COLUMN learner_profiles.pedagogical_needs IS 'Besoins pédagogiques (sans diagnostic médical)';
COMMENT ON COLUMN learner_profiles.notes IS 'Notes pédagogiques facultatives';
