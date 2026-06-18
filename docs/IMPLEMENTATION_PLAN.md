# INCLUSIA — Plan d'implémentation

## Phase 1 — Fondations ✅ (en cours)

- [x] Architecture projet `src/`
- [x] Schéma SQL PostgreSQL (`001_initial_schema.sql`)
- [x] Policies RLS Supabase (`002_rls_policies.sql`)
- [x] Types TypeScript
- [x] Configuration Supabase (client, server, middleware)
- [x] Composants UI de base (Button, Input, Card, Badge...)
- [x] Layout dashboard (sidebar, header, shell)
- [x] Pages auth : `/login`, `/register`, `/forgot-password`
- [x] Page dashboard avec stats et activité
- [x] Pages élèves : liste + création
- [x] Page documents : upload + liste
- [x] Mode démo (sans Supabase / OpenAI)

## Phase 2 — Moteur d'adaptation ✅

- [x] `src/prompts/` — Prompts par défaut par profil
- [x] `src/services/adaptation/` — Moteur d'adaptation
- [x] `src/repositories/` — Accès données Supabase
- [x] API `/api/adapt` — Endpoint principal
- [x] Page `/adaptations/new` — Wizard adaptation
- [x] Extraction texte PDF/DOCX/TXT
- [x] Upload Supabase Storage
- [x] Mode démo avec contenu simulé

## Phase 3 — Outputs enrichis

- [ ] Moteur mindmap (`/api/mindmap`)
- [ ] Service audio (`/api/audio`, `audio.service.ts`)
- [ ] Affichage résultats (cours, résumé, fiche, quiz, vocabulaire)
- [ ] Export PDF des supports adaptés

## Phase 4 — Profil dynamique

- [ ] Formulaire feedback post-adaptation
- [ ] API `/api/feedback`
- [ ] Moteur mise à jour `learning_preferences`
- [ ] Historique adaptations par élève

## Phase 5 — Admin prompts

- [ ] Page `/admin/prompts`
- [ ] CRUD templates + versions
- [ ] Test prompt (`/api/admin/prompts/test`)
- [ ] Rollback version
- [ ] Activation/désactivation

## Phase 6 — Analytics & Admin

- [ ] Tracking `analytics_events`
- [ ] Dashboard analytics admin
- [ ] Gestion écoles et rôles

## Phase 7 — Tests & CI

- [ ] Vitest : prompt builder, adaptation engine, permissions
- [ ] Tests intégration Supabase
- [ ] Playwright E2E : login → élève → upload → adaptation → feedback
- [ ] GitHub Actions : build, lint, typecheck, test
- [ ] Scripts `quality` dans package.json

## Phase 8 — Connecteurs & Déploiement

- [ ] Couche `services/connectors/` (Moodle, Teams, Google...)
- [ ] Guide Supabase, OpenAI, Vercel, GitHub
- [ ] Déploiement Vercel production
- [ ] OCR documents (futur)

## Ordre de priorité immédiat

1. Configurer Supabase (migrations + bucket `documents`)
2. Brancher authentification réelle
3. Implémenter upload + extraction documents
4. Construire moteur d'adaptation + API
5. Wizard adaptation complet

## Estimation

| Phase | Durée estimée |
|-------|---------------|
| Phase 1 | 1-2 jours ✅ |
| Phase 2 | 3-4 jours |
| Phase 3 | 2-3 jours |
| Phase 4 | 1-2 jours |
| Phase 5 | 2-3 jours |
| Phase 6 | 1-2 jours |
| Phase 7 | 2-3 jours |
| Phase 8 | 2-3 jours |

**Total MVP : ~3 semaines**
