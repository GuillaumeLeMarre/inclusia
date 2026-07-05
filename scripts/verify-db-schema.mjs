#!/usr/bin/env node
/**
 * Vérifie les tables et colonnes critiques du schéma Inclusia.
 * Usage: node --env-file=.env.local scripts/verify-db-schema.mjs
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requis dans .env.local");
  process.exit(1);
}

async function probe(table, select = "id") {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  const text = await res.text();
  let code;
  try {
    code = JSON.parse(text).code;
  } catch {
    code = null;
  }
  return { ok: res.ok, status: res.status, code, text };
}

const checks = [
  { name: "learner_profiles", table: "learner_profiles" },
  { name: "pedagogical_profiles (dimensions)", table: "pedagogical_profiles", select: "pedagogical_objectives" },
  { name: "adaptations (production_options)", table: "adaptations", select: "production_options" },
  { name: "adaptations (pdf_storage_path)", table: "adaptations", select: "pdf_storage_path" },
];

let failed = 0;

for (const check of checks) {
  const result = await probe(check.table, check.select ?? "id");
  if (result.ok) {
    console.log(`✅ ${check.name}`);
  } else if (result.code === "42703") {
    console.error(`❌ ${check.name} — colonne manquante (migration non appliquée)`);
    failed += 1;
  } else if (result.code === "42P01") {
    console.error(`❌ ${check.name} — table absente`);
    failed += 1;
  } else {
    console.error(`❌ ${check.name} — ${result.status} ${result.code ?? result.text.slice(0, 120)}`);
    failed += 1;
  }
}

const learner = await probe("learner_profiles");
const students = await probe("students");

if (!learner.ok && students.ok) {
  console.error("");
  console.error("Correctif : exécutez supabase/migrations/005_anonymous_learner_profiles.sql");
  failed += 1;
}

if (failed > 0) {
  console.error("");
  console.error("Appliquez les migrations manquantes :");
  console.error("  npm run supabase:db:push");
  console.error("  ou SQL Editor → supabase/migrations/*.sql");
  process.exit(1);
}

console.log("");
console.log("Schéma DB à jour pour Inclusia (profils + adaptations).");
process.exit(0);
