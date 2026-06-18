-- INCLUSIA - Row Level Security Policies

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptation_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptation_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper: rôle admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_school_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers
    WHERE id = auth.uid() AND role IN ('school_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_teacher_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM teachers WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- SCHOOLS
CREATE POLICY "Admins voient toutes les écoles"
  ON schools FOR SELECT
  USING (is_admin());

CREATE POLICY "School admins voient leur école"
  ON schools FOR SELECT
  USING (id = current_teacher_school_id() AND is_school_admin());

CREATE POLICY "Admins gèrent les écoles"
  ON schools FOR ALL
  USING (is_admin());

-- TEACHERS
CREATE POLICY "Enseignants voient leur profil"
  ON teachers FOR SELECT
  USING (id = auth.uid() OR is_admin() OR (is_school_admin() AND school_id = current_teacher_school_id()));

CREATE POLICY "Enseignants modifient leur profil"
  ON teachers FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins gèrent les enseignants"
  ON teachers FOR ALL
  USING (is_admin());

CREATE POLICY "Service auth crée profil enseignant"
  ON teachers FOR INSERT
  TO supabase_auth_admin
  WITH CHECK (true);

-- STUDENTS
CREATE POLICY "Enseignants voient leurs élèves"
  ON students FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR is_admin()
    OR (is_school_admin() AND school_id = current_teacher_school_id())
  );

CREATE POLICY "Enseignants créent leurs élèves"
  ON students FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Enseignants modifient leurs élèves"
  ON students FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Enseignants suppriment leurs élèves"
  ON students FOR DELETE
  USING (teacher_id = auth.uid());

-- LEARNING PREFERENCES
CREATE POLICY "Accès préférences via élève"
  ON learning_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = learning_preferences.student_id
        AND (s.teacher_id = auth.uid() OR is_admin())
    )
  );

-- DOCUMENTS
CREATE POLICY "Enseignants voient leurs documents"
  ON documents FOR SELECT
  USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY "Enseignants créent leurs documents"
  ON documents FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Enseignants modifient leurs documents"
  ON documents FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Enseignants suppriment leurs documents"
  ON documents FOR DELETE
  USING (teacher_id = auth.uid());

-- ADAPTATIONS
CREATE POLICY "Enseignants voient leurs adaptations"
  ON adaptations FOR SELECT
  USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY "Enseignants créent leurs adaptations"
  ON adaptations FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Enseignants modifient leurs adaptations"
  ON adaptations FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Enseignants suppriment leurs adaptations"
  ON adaptations FOR DELETE
  USING (teacher_id = auth.uid());

-- FEEDBACKS
CREATE POLICY "Enseignants gèrent leurs feedbacks"
  ON feedbacks FOR ALL
  USING (teacher_id = auth.uid() OR is_admin());

-- ADAPTATION PROFILES (lecture publique authentifiée)
CREATE POLICY "Profils visibles par utilisateurs authentifiés"
  ON adaptation_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins gèrent les profils"
  ON adaptation_profiles FOR ALL
  USING (is_admin());

-- PROMPT TEMPLATES
CREATE POLICY "Templates visibles par enseignants"
  ON adaptation_prompt_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins gèrent les templates"
  ON adaptation_prompt_templates FOR ALL
  USING (is_admin());

-- PROMPT VERSIONS
CREATE POLICY "Versions visibles par enseignants"
  ON adaptation_prompt_versions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins gèrent les versions"
  ON adaptation_prompt_versions FOR ALL
  USING (is_admin());

-- ANALYTICS
CREATE POLICY "Enseignants voient leurs analytics"
  ON analytics_events FOR SELECT
  USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY "Enseignants créent leurs analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins voient tout analytics"
  ON analytics_events FOR SELECT
  USING (is_admin());

-- STORAGE (documents bucket)
CREATE POLICY "Enseignants uploadent leurs documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Enseignants lisent leurs documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Enseignants suppriment leurs documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
