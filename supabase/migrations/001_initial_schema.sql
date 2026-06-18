-- INCLUSIA - Schéma PostgreSQL initial
-- Exécuter via Supabase SQL Editor ou CLI

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('teacher', 'school_admin', 'admin');
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'ready', 'error');
CREATE TYPE adaptation_status AS ENUM ('pending', 'processing', 'completed', 'error', 'demo');
CREATE TYPE document_format AS ENUM ('pdf', 'docx', 'txt');

-- Écoles
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'FR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enseignants (profil lié à auth.users)
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'teacher',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profils d'adaptation système
CREATE TABLE adaptation_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'learning',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Élèves
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_name TEXT,
  grade_level TEXT,
  profiles JSONB NOT NULL DEFAULT '[]',
  needs TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Préférences d'apprentissage dynamiques
CREATE TABLE learning_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  audio_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  diagrams_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  quiz_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  simplified_vocab BOOLEAN NOT NULL DEFAULT FALSE,
  adapted_font BOOLEAN NOT NULL DEFAULT FALSE,
  simplified_text BOOLEAN NOT NULL DEFAULT TRUE,
  difficulty_level INT NOT NULL DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  preferred_format TEXT DEFAULT 'mixed',
  metadata JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents importés
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type document_format NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  page_count INT,
  status document_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adaptations générées
CREATE TABLE adaptations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  profile_slugs JSONB NOT NULL DEFAULT '[]',
  status adaptation_status NOT NULL DEFAULT 'pending',
  adapted_content TEXT,
  summary TEXT,
  memory_sheet TEXT,
  quiz JSONB,
  keywords JSONB,
  simplified_questions JSONB,
  adapted_instructions TEXT,
  mindmap JSONB,
  audio_script TEXT,
  processing_time_ms INT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedbacks post-adaptation
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adaptation_id UUID NOT NULL REFERENCES adaptations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  understood BOOLEAN,
  too_long BOOLEAN,
  too_difficult BOOLEAN,
  more_diagrams BOOLEAN,
  more_audio BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates de prompts administrables
CREATE TABLE adaptation_prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES adaptation_profiles(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  prompt_type TEXT NOT NULL DEFAULT 'adaptation',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Versions de prompts (versioning + rollback)
CREATE TABLE adaptation_prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES adaptation_prompt_templates(id) ON DELETE CASCADE,
  version INT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, version)
);

-- Événements analytics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_teachers_school ON teachers(school_id);
CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_documents_teacher ON documents(teacher_id);
CREATE INDEX idx_adaptations_teacher ON adaptations(teacher_id);
CREATE INDEX idx_adaptations_student ON adaptations(student_id);
CREATE INDEX idx_adaptations_document ON adaptations(document_id);
CREATE INDEX idx_feedbacks_adaptation ON feedbacks(adaptation_id);
CREATE INDEX idx_analytics_teacher ON analytics_events(teacher_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_prompt_versions_template ON adaptation_prompt_versions(template_id);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER adaptations_updated_at BEFORE UPDATE ON adaptations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER adaptation_profiles_updated_at BEFORE UPDATE ON adaptation_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER adaptation_prompt_templates_updated_at BEFORE UPDATE ON adaptation_prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER learning_preferences_updated_at BEFORE UPDATE ON learning_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Profils d'adaptation par défaut
INSERT INTO adaptation_profiles (slug, name, description, category, sort_order) VALUES
  ('dyslexie', 'Dyslexie', 'Adaptation pour troubles de la lecture', 'learning', 1),
  ('dysorthographie', 'Dysorthographie', 'Adaptation pour troubles de l''écriture', 'learning', 2),
  ('dyspraxie', 'Dyspraxie', 'Adaptation pour troubles de la motricité fine', 'motor', 3),
  ('dysphasie', 'Dysphasie', 'Adaptation pour troubles du langage oral', 'language', 4),
  ('tdah', 'TDAH', 'Adaptation pour déficit de l''attention', 'attention', 5),
  ('tsa', 'TSA', 'Adaptation pour troubles du spectre autistique', 'social', 6),
  ('handicap_moteur', 'Handicap moteur', 'Adaptation pour mobilité réduite', 'motor', 7),
  ('deficience_visuelle', 'Déficience visuelle', 'Adaptation pour malvoyants', 'sensory', 8),
  ('deficience_auditive', 'Déficience auditive', 'Adaptation pour malentendants', 'sensory', 9),
  ('allophone', 'Élève allophone', 'Adaptation pour non-francophones', 'language', 10),
  ('difficultes_apprentissage', 'Difficultés d''apprentissage', 'Adaptation générale', 'learning', 11),
  ('hpi', 'HPI', 'Adaptation pour élèves à haut potentiel', 'gifted', 12),
  ('personnalise', 'Profil personnalisé', 'Profil sur mesure', 'custom', 13);

-- Fonction : créer profil enseignant à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value public.user_role;
BEGIN
  BEGIN
    user_role_value := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::public.user_role,
      'teacher'::public.user_role
    );
  EXCEPTION
    WHEN others THEN
      user_role_value := 'teacher'::public.user_role;
  END;

  INSERT INTO public.teachers (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), 'Enseignant'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), 'Utilisateur'),
    user_role_value
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.teachers TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction : créer préférences par défaut à la création d'un élève
CREATE OR REPLACE FUNCTION handle_new_student()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO learning_preferences (student_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_student_created
  AFTER INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION handle_new_student();

-- Storage bucket (à exécuter séparément si besoin)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
