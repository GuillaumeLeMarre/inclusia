# Profils pédagogiques Inclusia

Inclusia distingue **profils système** (administrés), **profils personnels enseignants** (dupliqués / personnalisés) et **profils apprenants** (contexte anonyme pour une adaptation).

## Terminologie

| Utiliser | Ne pas utiliser |
|----------|-----------------|
| Profil pédagogique | Pathologie |
| Besoin d'adaptation | Diagnostic |
| Préférence pédagogique | Maladie |

## Profils système

- Table : `pedagogical_profiles`
- Gérés via `/admin/profiles` (rôle `admin`)
- Champs : slug, nom, catégorie, description, prompts, règles, niveau, options
- Versionnés dans `pedagogical_profile_versions`

### Fallback JSON

Fichier : `seed/default-pedagogical-profiles.json`

Ordre de chargement pour le moteur IA :

1. Profil personnel enseignant (`teacher_profiles`)
2. Profil système Supabase (`pedagogical_profiles`)
3. Profil fallback JSON
4. Erreur

Restauration admin : `POST /api/admin/profiles/restore` — recrée / met à jour les profils système sans toucher aux profils enseignants.

## Profils personnels enseignants

- Table : `teacher_profiles`
- Interface : `/profiles`
- Héritent d'un profil système (`source_profile_id`)
- Personnalisation : `custom_prompt`, `custom_rules`, options
- Versionnés dans `teacher_profile_versions`
- Import / export JSON : `/api/profiles/export`, `/api/profiles/import`

## Profils apprenants

- Table : `learner_profiles` (ex-élèves anonymes)
- Interface : `/learners`
- Contextualisent une adaptation (niveau, besoins) sans données nominatives

## Construction du prompt IA

Service : `profile-prompt-builder.service.ts`

**Profil système :**

```
Prompt global × Profil système × Règles × Document
```

**Profil personnel :**

```
Prompt global × Profil système × Règles système × Options × Règles perso × Prompt perso × Document
```

Résolution : `profile-resolver.service.ts`  
Journalisation : colonne `adaptations.profile_source` (`TEACHER_PROFILE` | `SYSTEM_PROFILE` | `FALLBACK_PROFILE`)

## API

| Route | Rôle |
|-------|------|
| `GET/POST /api/admin/profiles` | CRUD profils système |
| `POST /api/admin/profiles/test` | Test prompt (sans sauvegarde) |
| `GET/POST /api/admin/profiles/versions` | Historique / restauration |
| `POST /api/admin/profiles/restore` | Restauration depuis JSON |
| `GET/POST /api/profiles` | Profils personnels enseignant |
| `POST /api/profiles/duplicate` | Duplication |
| `GET /api/profiles/export` | Export JSON |
| `POST /api/profiles/import` | Import JSON |
| `GET /api/learners` | Profils apprenants |

## Migration depuis l'ancien modèle

| Avant | Après |
|-------|-------|
| `/profiles` (apprenants) | `/learners` |
| `ADAPTATION_PROFILES` (constantes) | `pedagogical_profiles` + fallback JSON |
| `profile-instructions.ts` (hardcodé) | `pedagogical_rules` en base |
| Slugs multiples au wizard | Profil pédagogique unique |

Les slugs legacy restent supportés en repli si aucun profil pédagogique n'est sélectionné.

## Déploiement

1. Appliquer `supabase/migrations/009_pedagogical_profiles.sql`
2. Se connecter en admin → **Restaurer les profils système**
3. Vérifier `/profiles` et `/admin/profiles`

## Tests

```bash
npm run test:unit
```

Fichier : `tests/unit/pedagogical-profiles.test.ts`
