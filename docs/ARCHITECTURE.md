# INCLUSIA — Architecture

> L'IA qui adapte l'école à chaque élève

## Vue d'ensemble

Inclusia est une plateforme SaaS EdTech qui adapte automatiquement les supports pédagogiques aux besoins spécifiques de chaque élève.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 15 App Router · TypeScript · Tailwind · Shadcn/UI  │
├─────────────────────────────────────────────────────────────┤
│                     API ROUTES (Next.js)                     │
│  /api/students · /api/documents · /api/adapt · /api/...     │
├──────────────┬──────────────────────┬───────────────────────┤
│   Services   │    Repositories      │      Prompts IA       │
│  (métier)    │   (accès données)    │   (administrables)    │
├──────────────┴──────────────────────┴───────────────────────┤
│                    SUPABASE (BaaS)                           │
│  PostgreSQL · Auth · Storage · RLS                          │
├─────────────────────────────────────────────────────────────┤
│                      OPENAI GPT-5.5                          │
│  Adaptation · Résumé · Quiz · Mindmap · Audio               │
└─────────────────────────────────────────────────────────────┘
```

## Arborescence

```
inclusia/
├── src/
│   ├── app/                          # Routes Next.js
│   │   ├── (auth)/                   # Login, register, forgot-password
│   │   ├── (dashboard)/              # Pages protégées
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── documents/
│   │   │   ├── adaptations/
│   │   │   └── admin/prompts/
│   │   └── api/                      # API Routes
│   │       ├── students/
│   │       ├── documents/
│   │       ├── adapt/
│   │       ├── feedback/
│   │       ├── mindmap/
│   │       ├── audio/
│   │       └── admin/prompts/
│   ├── components/
│   │   ├── ui/                       # Shadcn/UI
│   │   ├── layout/                   # Shell, sidebar, header
│   │   └── brand/                    # Logo, identité
│   ├── features/                     # Domaines métier (UI)
│   │   ├── auth/
│   │   ├── students/
│   │   ├── documents/
│   │   ├── adaptations/
│   │   ├── feedback/
│   │   ├── mindmaps/
│   │   ├── audio/
│   │   ├── admin/
│   │   └── analytics/
│   ├── services/                     # Logique métier
│   │   ├── adaptation/
│   │   ├── audio/
│   │   ├── mindmap/
│   │   ├── demo/
│   │   └── connectors/               # Moodle, Teams, etc.
│   ├── repositories/                 # Accès Supabase
│   ├── lib/
│   │   ├── pdf/                      # Export PDF (parse Markdown, jsPDF, schémas)
│   │   └── ...                       # Utils, config, Supabase clients
│   ├── prompts/                      # Prompts par défaut
│   ├── hooks/                        # React hooks
│   ├── types/                        # Types TypeScript
│   ├── schemas/                      # Validation Zod
│   └── middleware.ts
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── ARCHITECTURE.md
    ├── FALC.md
    ├── PDF_EXPORT.md
    └── IMPLEMENTATION_PLAN.md
```

## Principes

| Règle | Détail |
|-------|--------|
| Taille max fichier | 400 lignes (objectif 200-300) |
| Séparation | UI / métier / données / prompts |
| Sécurité | RLS Supabase, clé OpenAI côté serveur uniquement |
| Mode démo | Fonctionnel sans OPENAI_API_KEY ni Supabase |
| Extensibilité | Profils, connecteurs, prompts administrables |

## Flux principal

```
Enseignant → Crée élève → Importe document → Sélectionne profil
    → Clique "Adapter" → API /api/adapt → OpenAI → Résultats
    → Feedback → Mise à jour learning_preferences
```

## Palette design

| Token | Valeur |
|-------|--------|
| Primary | `#4F46E5` |
| Secondary | `#14B8A6` |
| Accent | `#FBBF24` |
| Background | `#F8FAFC` |
| Text | `#0F172A` |
