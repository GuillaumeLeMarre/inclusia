-- Profils pédagogiques administrables (système + personnels enseignants)

CREATE TYPE profile_source AS ENUM (
  'TEACHER_PROFILE',
  'SYSTEM_PROFILE',
  'FALLBACK_PROFILE'
);

-- Profils système
CREATE TABLE pedagogical_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'learning',
  description TEXT,
  system_prompt TEXT NOT NULL DEFAULT '',
  user_prompt TEXT NOT NULL DEFAULT '',
  pedagogical_rules TEXT NOT NULL DEFAULT '',
  adaptation_level TEXT NOT NULL DEFAULT 'standard'
    CHECK (adaptation_level IN ('standard', 'simplified', 'falc')),
  options JSONB NOT NULL DEFAULT '{
    "generate_summary": true,
    "generate_quiz": true,
    "generate_mindmap": true,
    "generate_audio": false,
    "generate_falc": false
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pedagogical_profile_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES pedagogical_profiles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  pedagogical_rules TEXT NOT NULL,
  adaptation_level TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  change_note TEXT,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, version)
);

-- Profils personnels enseignants
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  source_profile_id UUID REFERENCES pedagogical_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  custom_prompt TEXT,
  custom_rules TEXT,
  adaptation_level TEXT NOT NULL DEFAULT 'standard'
    CHECK (adaptation_level IN ('standard', 'simplified', 'falc')),
  options JSONB NOT NULL DEFAULT '{
    "generate_summary": true,
    "generate_quiz": true,
    "generate_mindmap": true,
    "generate_audio": false,
    "generate_falc": false
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teacher_profile_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  source_profile_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  custom_prompt TEXT,
  custom_rules TEXT,
  adaptation_level TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN NOT NULL,
  change_note TEXT,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, version)
);

-- Traçabilité sur les adaptations
ALTER TABLE adaptations
  ADD COLUMN IF NOT EXISTS pedagogical_profile_id UUID REFERENCES pedagogical_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS teacher_profile_id UUID REFERENCES teacher_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS profile_source profile_source;

CREATE INDEX idx_pedagogical_profiles_slug ON pedagogical_profiles(slug);
CREATE INDEX idx_pedagogical_profiles_active ON pedagogical_profiles(is_active);
CREATE INDEX idx_pedagogical_profile_versions_profile ON pedagogical_profile_versions(profile_id);
CREATE INDEX idx_teacher_profiles_teacher ON teacher_profiles(teacher_id);
CREATE INDEX idx_teacher_profiles_source ON teacher_profiles(source_profile_id);
CREATE INDEX idx_teacher_profile_versions_profile ON teacher_profile_versions(profile_id);
CREATE INDEX idx_adaptations_pedagogical_profile ON adaptations(pedagogical_profile_id);
CREATE INDEX idx_adaptations_teacher_profile ON adaptations(teacher_profile_id);

CREATE TRIGGER pedagogical_profiles_updated_at
  BEFORE UPDATE ON pedagogical_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER teacher_profiles_updated_at
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE pedagogical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedagogical_profile_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profile_versions ENABLE ROW LEVEL SECURITY;

-- Profils système : lecture pour tous les enseignants authentifiés (actifs), admin CRUD
CREATE POLICY "Lecture profils système actifs"
  ON pedagogical_profiles FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin gère profils système"
  ON pedagogical_profiles FOR ALL
  USING (is_admin());

CREATE POLICY "Admin versions profils système"
  ON pedagogical_profile_versions FOR ALL
  USING (is_admin());

CREATE POLICY "Lecture versions profils système"
  ON pedagogical_profile_versions FOR SELECT
  USING (is_admin());

-- Profils personnels : enseignant propriétaire
CREATE POLICY "Enseignant voit ses profils personnels"
  ON teacher_profiles FOR SELECT
  USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY "Enseignant crée ses profils personnels"
  ON teacher_profiles FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Enseignant modifie ses profils personnels"
  ON teacher_profiles FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Enseignant supprime ses profils personnels"
  ON teacher_profiles FOR DELETE
  USING (teacher_id = auth.uid());

CREATE POLICY "Enseignant voit versions profils personnels"
  ON teacher_profile_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = teacher_profile_versions.profile_id
        AND (tp.teacher_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Enseignant crée versions profils personnels"
  ON teacher_profile_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.id = teacher_profile_versions.profile_id
        AND tp.teacher_id = auth.uid()
    )
  );
