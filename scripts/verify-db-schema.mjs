#!/usr/bin/env node
/**
 * Vérifie que la table learner_profiles existe (migration 005 appliquée).
 * Usage: node --env-file=.env.local scripts/verify-db-schema.mjs
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requis dans .env.local");
  process.exit(1);
}

async function probe(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  const text = await res.text();
  let code;
  try {
    code = JSON.parse(text).code;
  } catch {
    code = null;
  }
  return { ok: res.ok, status: res.status, code };
}

const learner = await probe("learner_profiles");
const students = await probe("students");

if (learner.ok) {
  console.log("✅ Table public.learner_profiles — OK (migration 005 appliquée)");
  if (students.ok) {
    console.warn("⚠️  Ancienne table public.students encore visible — vérifiez le schéma");
  }
  process.exit(0);
}

if (students.ok) {
  console.error("❌ Migration 005 NON appliquée");
  console.error("   → La table students existe encore, learner_profiles est absente.");
  console.error("");
  console.error("Correctif (2 min) :");
  console.error("1. Ouvrez https://supabase.com/dashboard → votre projet → SQL Editor");
  console.error("2. Collez et exécutez le fichier :");
  console.error("   supabase/migrations/005_anonymous_learner_profiles.sql");
  console.error("3. Relancez : npm run db:verify");
  process.exit(1);
}

console.error("❌ Ni learner_profiles ni students trouvées.");
console.error("   Exécutez d'abord supabase/migrations/001_initial_schema.sql");
process.exit(1);
