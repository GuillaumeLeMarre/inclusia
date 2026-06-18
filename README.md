# Inclusia

> L'IA qui adapte l'école à chaque élève

Plateforme SaaS EdTech qui adapte automatiquement les supports pédagogiques aux besoins spécifiques de chaque élève (dyslexie, TDAH, TSA, allophones, etc.).

## Stack

- **Frontend** : Next.js 16, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL via Supabase
- **Auth & Storage** : Supabase
- **IA** : OpenAI (Phase 2)

## Démarrage rapide

```bash
npm install
cp .env.example .env.local   # puis renseignez les clés Supabase
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Sans `.env.local`, l'application fonctionne en **mode démo** avec des données fictives.

## Configuration Supabase

Guide complet : **[docs/guides/SUPABASE.md](docs/guides/SUPABASE.md)**

Résumé :

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter les migrations SQL (`supabase/migrations/`)
3. Copier les clés API dans `.env.local`
4. Configurer les redirect URLs : `/auth/callback`

```bash
# Vérifier la connexion
npm run supabase:check

# Supabase local (Docker requis)
npm run supabase:start
npm run supabase:status
```

## Structure

```
src/
├── app/           # Routes (auth, dashboard, students, documents)
├── components/    # UI + layout
├── features/      # Domaines métier
├── services/      # Logique métier
├── lib/supabase/  # Clients Supabase
└── types/         # Types TypeScript + database.ts
```

Documentation architecture : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run supabase:start` | Supabase local |
| `npm run supabase:db:push` | Pousser migrations vers cloud |
| `npm run supabase:check` | Tester connexion Supabase |

## Licence

Propriétaire — Inclusia
