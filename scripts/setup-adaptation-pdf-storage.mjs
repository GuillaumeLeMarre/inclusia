#!/usr/bin/env node
/**
 * Crée le bucket Storage "adaptations" et vérifie la colonne pdf_storage_path.
 * Usage: node --env-file=.env.local scripts/setup-adaptation-pdf-storage.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !serviceRoleKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "adaptations";

async function ensureBucket() {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    throw new Error(`listBuckets: ${listError.message}`);
  }

  if (buckets?.some((bucket) => bucket.id === BUCKET)) {
    console.log(`✅ Bucket "${BUCKET}" déjà présent`);
    return;
  }

  const { error: createError } = await admin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"],
  });

  if (createError) {
    throw new Error(`createBucket: ${createError.message}`);
  }

  console.log(`✅ Bucket "${BUCKET}" créé`);
}

async function checkPdfStoragePathColumn() {
  if (!anonKey) {
    console.warn("⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY manquante — colonne non vérifiée");
    return false;
  }

  const res = await fetch(`${url}/rest/v1/adaptations?select=pdf_storage_path&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });

  if (res.ok) {
    console.log("✅ Colonne adaptations.pdf_storage_path présente");
    return true;
  }

  const body = await res.text();
  let code;
  try {
    code = JSON.parse(body).code;
  } catch {
    code = null;
  }

  if (code === "42703") {
    console.error("❌ Colonne adaptations.pdf_storage_path absente");
    console.error("");
    console.error("Exécutez dans Supabase → SQL Editor :");
    console.error("  supabase/migrations/013_adaptation_pdf_storage.sql");
    console.error("");
    console.error("Ou : npm run supabase:db:push (après npx supabase link)");
    return false;
  }

  console.error(`❌ Vérification colonne échouée (${res.status}) : ${body.slice(0, 160)}`);
  return false;
}

try {
  await ensureBucket();
  const columnOk = await checkPdfStoragePathColumn();
  process.exit(columnOk ? 0 : 1);
} catch (err) {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
}
