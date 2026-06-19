# Guide Supabase — Inclusia

Ce guide configure Supabase pour l'authentification, la base PostgreSQL, le storage et la sécurité RLS.

## Option A — Projet cloud (recommandé pour production)

### 1. Créer le projet

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → nommez-le `inclusia`
3. Choisissez une région proche (ex. `West EU (Paris)`)
4. Définissez un mot de passe base de données (à conserver)

### 2. Exécuter les migrations SQL

Dans **SQL Editor**, exécutez dans l'ordre :

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_setup.sql`
4. `supabase/migrations/004_fix_auth_signup.sql` (si inscription en erreur)
5. `supabase/migrations/005_anonymous_learner_profiles.sql` (**obligatoire** — profils anonymes)

Vérifier après migration :

```bash
npm run db:verify
```

Ou via CLI (voir Option B, étape link) :

```bash
npx supabase link --project-ref VOTRE_PROJECT_REF
npx supabase db push
```

### 3. Configurer l'authentification

Dans **Authentication > URL Configuration** :

| Paramètre | Valeur dev | Valeur prod |
|-----------|------------|-------------|
| Site URL | `http://localhost:3000` | `https://votre-domaine.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://votre-domaine.vercel.app/auth/callback` |

Dans **Authentication > Providers > Email** :

- Enable Email provider : **ON**
- Confirm email : **OFF** en dev (plus simple), **ON** en prod

### 4. Récupérer les clés API

**Settings > API** :

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (secret, serveur uniquement)

### 5. Configurer l'application

```bash
cp .env.example .env.local
```

Remplissez `.env.local` avec vos clés, puis :

```bash
npm run dev
```

Testez :

1. `/register` — créer un compte enseignant
2. `/login` — se connecter
3. `/profiles/new` — créer un profil (persisté en base)
4. `/dashboard` — stats réelles

---

## Option B — Supabase local (développement offline)

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- [Supabase CLI](https://supabase.com/docs/guides/cli) :

```bash
npm install -g supabase
# ou
npx supabase --version
```

### Démarrer Supabase local

```bash
npm run supabase:start
```

La première exécution télécharge les images Docker (~2 min).

Récupérez les clés :

```bash
npm run supabase:status
```

Copiez `API URL`, `anon key` et `service_role key` dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Les migrations dans `supabase/migrations/` sont appliquées automatiquement au démarrage.

### Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run supabase:start` | Démarrer Supabase local |
| `npm run supabase:stop` | Arrêter les conteneurs |
| `npm run supabase:status` | URL + clés API |
| `npm run supabase:db:reset` | Réinitialiser la base (migrations) |
| `npm run supabase:studio` | Ouvrir Supabase Studio (port 54323) |

Studio local : [http://127.0.0.1:54323](http://127.0.0.1:54323)

---

## Architecture Supabase dans Inclusia

```
src/lib/supabase/
├── client.ts      → Client navigateur (anon key)
├── server.ts      → Client serveur (cookies session)
├── admin.ts       → Client service role (API admin)
├── middleware.ts  → Refresh session + protection routes
└── env.ts         → Validation variables d'environnement

src/app/auth/callback/route.ts  → Callback OAuth / email
```

### Tables principales

| Table | Rôle |
|-------|------|
| `teachers` | Profil enseignant (lié à `auth.users`) |
| `students` | Fiches élèves |
| `learning_preferences` | Préférences dynamiques |
| `documents` | Métadonnées fichiers importés |
| `adaptations` | Supports générés |
| `adaptation_profiles` | 13 profils inclusifs |
| `adaptation_prompt_templates` | Prompts administrables |

### Storage

- Bucket : `documents` (privé, max 20 Mo)
- Chemin : `{teacher_id}/{filename}`
- Formats : PDF, DOCX, TXT
- RLS : chaque enseignant accède uniquement à son dossier

### Sécurité RLS

- Chaque enseignant ne voit que **ses** élèves, documents et adaptations
- `service_role` bypass RLS — réservé au backend (`admin.ts`)
- `OPENAI_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` jamais côté client

---

## Déploiement Vercel

Dans **Vercel > Settings > Environment Variables**, ajoutez :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` = URL Vercel

Mettez à jour les Redirect URLs Supabase avec l'URL de production.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Mode démo affiché | Vérifiez `.env.local` et redémarrez `npm run dev` |
| Erreur RLS | Vérifiez que l'utilisateur est connecté et que `teachers` existe |
| Profil enseignant absent | Le trigger `handle_new_user` crée le profil à l'inscription |
| Upload échoue | Vérifiez migration `003_storage_setup.sql` |
| Redirect auth échoue | Ajoutez `/auth/callback` dans Supabase URL Configuration |

### Vérifier la connexion

```bash
npm run supabase:check
```

---

## Lier un projet cloud à la CLI

```bash
npx supabase login
npx supabase link --project-ref xxxxxxxxxxxx
npx supabase db push
```

Le `project-ref` se trouve dans l'URL du dashboard :  
`https://supabase.com/dashboard/project/xxxxxxxxxxxx`
