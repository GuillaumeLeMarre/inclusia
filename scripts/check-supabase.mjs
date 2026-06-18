#!/usr/bin/env node
/**
 * Vérifie la connexion Supabase (variables + ping API).
 * Usage: node scripts/check-supabase.mjs
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.error("❌ Variables manquantes dans .env.local :");
  if (!url) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.error("\nCopiez .env.example vers .env.local et renseignez les clés.");
  console.error("Guide : docs/guides/SUPABASE.md");
  process.exit(1);
}

try {
  const res = await fetch(`${url}/rest/v1/adaptation_profiles?select=slug&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (res.ok || res.status === 200 || res.status === 404) {
    console.log("✅ Supabase connecté");
    console.log(`   URL : ${url}`);

    const profilesRes = await fetch(
      `${url}/rest/v1/adaptation_profiles?select=count&limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Prefer: "count=exact",
        },
      },
    );

    if (profilesRes.ok) {
      const count = profilesRes.headers.get("content-range")?.split("/")[1] ?? "?";
      console.log(`   Profils d'adaptation : ${count} en base`);
    } else {
      console.warn("⚠️  API OK mais table adaptation_profiles inaccessible (migrations à exécuter ?)");
    }
    process.exit(0);
  }

  console.error(`❌ Erreur HTTP ${res.status}`);
  process.exit(1);
} catch (err) {
  console.error("❌ Connexion impossible :", err.message);
  process.exit(1);
}
