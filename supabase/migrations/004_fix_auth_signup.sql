-- INCLUSIA - Fix inscription Auth (erreur 500 signup)
-- Exécuter dans Supabase SQL Editor si l'inscription échoue

-- 1. Recréer la fonction avec search_path et gestion d'erreurs robuste
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

-- 2. Recréer le trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Permissions requises pour que Auth puisse écrire dans public.teachers
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT ALL ON TABLE public.teachers TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- 4. Policy INSERT pour le service auth (fallback si SECURITY DEFINER insuffisant)
DROP POLICY IF EXISTS "Service auth crée profil enseignant" ON public.teachers;

CREATE POLICY "Service auth crée profil enseignant"
  ON public.teachers
  FOR INSERT
  TO supabase_auth_admin
  WITH CHECK (true);
