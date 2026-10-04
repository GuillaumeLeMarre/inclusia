-- INCLUSIA - Durcissement des fonctions (alertes Supabase Security Advisor)
--
-- 1. search_path figé sur toutes les fonctions public (lint 0011).
--    `public, pg_temp` : les corps existants référencent des tables non qualifiées.
-- 2. Fonctions trigger non appelables via /rest/v1/rpc (lints 0028/0029).
--    Un trigger s'exécute sans que le rôle appelant ait EXECUTE sur la fonction.
--
-- Volontairement conservé : EXECUTE pour anon/authenticated sur is_admin(),
-- is_school_admin() et current_teacher_school_id(). Les policies RLS (rôle public)
-- les appellent pour toute requête, y compris anonyme. Les révoquer ferait
-- échouer ces requêtes avec "permission denied for function".
-- Ces fonctions ne renvoient que des informations sur l'appelant (auth.uid()).

ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_school_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.current_teacher_school_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_learner_profile() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_learner_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
