# Profils pédagogiques Inclusia

Inclusia distingue **profils système** (administrés), **profils personnels enseignants** (dupliqués / personnalisés) et **profils apprenants** (contexte anonyme pour une adaptation).

## Terminologie

| Utiliser | Ne pas utiliser |
|----------|-----------------|
| Profil pédagogique | Pathologie |
| Besoin d'adaptation | Diagnostic |
| Préférence pédagogique | Maladie |

## Modèle de stratégie pédagogique

Chaque profil système porte une **stratégie structurée** (`pedagogical_strategy`, JSONB) :

| Dimension | Exemple |
|-----------|---------|
| `objectives` | Réduire la charge de lecture |
| `linguistic_rules` | Phrases courtes, vocabulaire simple |
| `layout_rules` | Texte aéré, listes à puces |
| `structure_rules` | Résumer chaque section, fiche mémoire |
| `visual_aids` | Schémas, pictogrammes |
| `audio_aids` | Script audio, lecture section par section |
| `exercise_adaptations` | QCM, glisser-déposer |
| `evaluation_rules` | Questions courtes, feedback immédiat |
| `avoid` | Métaphores, passif, abstractions (FALC) |

Le champ texte `pedagogical_rules` reste pour compatibilité ; le moteur IA privilégie la stratégie structurée.

Types : `src/types/pedagogical-strategy.ts`  
Validation : `src/schemas/pedagogical-strategy.schema.ts`

## Profils système

- Table : `pedagogical_profiles`
- Gérés via `/admin/profiles` (rôle `admin`)
- Champs : slug, nom, catégorie, description, prompts, règles, **stratégie**, niveau, options
- Versionnés dans `pedagogical_profile_versions` (stratégie incluse)

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
- Personnalisation : `custom_prompt`, `custom_rules`, **`custom_strategy`**, options
- **Ne remplace pas** les règles système : fusion via `mergeWithTeacherCustomization()`
- Versionnés dans `teacher_profile_versions`

## Adaptation multi-profils

Plusieurs profils système peuvent être combinés (ex. Dyslexie + TDAH).

- API : `pedagogicalProfileSlugs: string[]` ou `pedagogicalProfileIds: string[]`
- Wizard : sélection principale + cases à cocher « Combiner avec d'autres profils »
- Fusion : `strategy-merge.service.ts` — union dédupliquée, priorité par slug (`falc` > `dyslexie` > `tdah` > …)

## Construction du prompt IA

Services :

- `profile-resolver.service.ts` — résolution et fusion
- `strategy-prompt.service.ts` — `strategyToPromptBlock()` depuis la stratégie
- `profile-prompt-builder.service.ts` — assemblage final

**Profil système :**

```
Prompt global × Profil système × Stratégie structurée × Document
```

**Profil personnel :**

```
Prompt global × Stratégie système fusionnée × Stratégie enseignant × Prompt perso × Document
```

Les prompts géants hardcodés sont évités : le bloc stratégie est généré dynamiquement.

Journalisation : `adaptations.profile_source`, `adaptations.pedagogical_profile_slugs`

## Score qualité (`adaptation_quality_score`)

Calculé après chaque adaptation (0–100) par `adaptation-quality-score.service.ts` :

- Lisibilité (longueur moyenne des phrases)
- Structure (titres, listes, paragraphes)
- Conformité FALC (si profil FALC)
- Présence résumé, fiche mémoire, mots clés

Persisté dans `adaptations.adaptation_quality_score`.

## Profils apprenants

- Table : `learner_profiles` (ex-élèves anonymes)
- Interface : `/learners`
- Contextualisent une adaptation (niveau, besoins) sans données nominatives

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
| `POST /api/adapt` | Adaptation (`pedagogicalProfileSlugs[]` supporté) |

## Migration depuis l'ancien modèle

| Avant | Après |
|-------|-------|
| `/profiles` (apprenants) | `/learners` |
| `ADAPTATION_PROFILES` (constantes) | `pedagogical_profiles` + fallback JSON |
| `profile-instructions.ts` (hardcodé) | `pedagogical_strategy` en base |
| Slugs multiples au wizard | Profil pédagogique + combinaison optionnelle |

Les slugs legacy restent supportés en repli si aucun profil pédagogique n'est sélectionné.

## Déploiement

1. Appliquer `supabase/migrations/009_pedagogical_profiles.sql`
2. Appliquer `supabase/migrations/011_pedagogical_dimensions.sql` (inclut les prérequis de 010)
3. Se connecter en admin → **Restaurer les profils système**

## Interface admin (`/admin/profiles`)

Éditeur à onglets avec `ProfileRuleListEditor` pour chaque dimension :

- Général, Prompts, Objectifs, Langage, Mise en page, Structuration, Visuel, Audio, Exercices, Évaluation, Options, Historique
- Ajout / modification / suppression / réordonnancement / duplication / restauration de règles
- Maximum 50 règles × 300 caractères par section (validation Zod)

## Interface enseignant (`/profiles`)

Même composant pour les 8 sections `custom_*` — complètent le profil système sans le remplacer.

## Tests

```bash
npm run test:unit
```

Fichier : `tests/unit/pedagogical-profiles.test.ts`
