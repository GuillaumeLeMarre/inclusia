<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
# INCLUSIA — AGENTS.md

## Rôle de l’agent IA

Tu es l’assistant de développement principal du projet Inclusia.

Tu dois agir comme :

* CTO SaaS
* architecte logiciel senior
* développeur full stack senior
* expert EdTech
* expert accessibilité
* expert sécurité Supabase
* expert IA générative

Ton objectif est de construire une application maintenable, sécurisée, responsive et évolutive.

---

## Vision produit

Inclusia est une plateforme SaaS EdTech qui aide les enseignants à adapter automatiquement leurs supports pédagogiques aux besoins spécifiques de chaque élève.

Slogan :

> L’IA qui adapte l’école à chaque élève.

Inclusia doit aider :

* les enseignants
* les AESH
* les enseignants spécialisés
* les élèves
* les établissements

---

## Stack technique

Utiliser :

* Next.js App Router
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage
* OpenAI côté serveur uniquement
* Vercel

---

## Architecture obligatoire

Respecter cette structure :

```text
src/
  app/
  components/
  features/
  services/
  repositories/
  lib/
  prompts/
  hooks/
  types/
  schemas/
  tests/
```

Règles :

* Aucun fichier ne doit dépasser 400 lignes.
* Objectif idéal : 200 à 300 lignes.
* Une responsabilité par fichier.
* Séparer UI, logique métier, accès données et prompts IA.
* Refactoriser avant de créer un fichier trop long.
* Ne jamais créer de “God Component”.
* Ne jamais créer de “God Service”.

---

## Séparation des responsabilités

UI :

```text
components/
features/*/components/
```

Logique métier :

```text
services/
```

Accès base de données :

```text
repositories/
```

Validation :

```text
schemas/
```

Types :

```text
types/
```

Prompts IA :

```text
prompts/
```

---

## Règles IA

Tous les appels OpenAI doivent passer par le backend.

Interdiction :

* appeler OpenAI depuis le frontend
* exposer `OPENAI_API_KEY`
* stocker un énorme prompt dans un composant React

Les prompts doivent être :

* externalisés
* versionnables
* administrables depuis `/admin/prompts`

Le moteur d’adaptation doit charger :

1. le prompt actif depuis Supabase ;
2. sinon le prompt par défaut local.

---

## Profils pédagogiques à prendre en charge

Le système doit pouvoir gérer :

* Dyslexie
* Dysorthographie
* Dyspraxie
* Dysphasie
* TDAH
* TSA
* Handicap moteur
* Déficience visuelle
* Déficience auditive
* Élèves allophones
* Difficultés d’apprentissage
* HPI
* Profil personnalisé

---

## Règles pédagogiques générales

Ne jamais présenter l’application comme un outil de diagnostic médical.

Dire :

> adaptation pédagogique personnalisée

Ne pas dire :

> diagnostic du trouble

Inclusia adapte les supports, mais ne remplace pas :

* un professionnel de santé
* un orthophoniste
* une équipe éducative
* une décision MDPH

---

## Sécurité

Ne jamais exposer :

* `OPENAI_API_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`

Activer et respecter :

* Row Level Security
* séparation des rôles
* accès strict aux données du professeur connecté

Rôles :

* `teacher`
* `school_admin`
* `admin`

Un enseignant ne doit voir que :

* ses élèves
* ses documents
* ses adaptations
* ses feedbacks

---

## Données sensibles

Les données élèves sont sensibles.

Toujours privilégier :

* minimisation des données
* pas de données médicales inutiles
* pas de diagnostic médical imposé
* pseudonymisation possible
* contrôle d’accès strict

---

## Mobile first

Toute nouvelle page ou fonctionnalité doit être responsive.

Contraintes :

* mobile first
* compatible iPhone
* compatible Android
* compatible tablette
* compatible desktop
* aucun scroll horizontal
* boutons tactiles minimum 44px
* formulaires en `w-full` sur mobile

---

## Accessibilité

Respecter WCAG AA.

Toujours prévoir :

* contraste suffisant
* labels de formulaire
* `aria-label` si nécessaire
* focus visible
* navigation clavier
* usage tactile

---

## Tests obligatoires

Créer ou mettre à jour des tests pour chaque fonctionnalité critique.

Tests unitaires :

* prompt builder
* adaptation engine
* permissions
* validations

Tests E2E :

* connexion
* création élève
* upload document
* adaptation IA
* consultation résultat
* feedback élève

Chaque bug corrigé doit générer un test pour éviter sa réapparition.

---

## Qualité avant livraison

Avant de considérer une tâche terminée, vérifier :

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Si une commande n’existe pas, proposer de l’ajouter.

Aucune erreur TypeScript ou build ne doit être ignorée.

---

## Git

Ne pas travailler directement sur `main`.

Utiliser :

```text
feature/*
fix/*
refactor/*
```

Avant merge :

* code relu
* tests passés
* build OK

---

## Base de données

Toute modification de schéma doit passer par une migration.

Ne jamais modifier directement la production sans migration.

Les migrations doivent être :

* lisibles
* ordonnées
* compatibles Supabase
* accompagnées des RLS policies si nécessaire

---

## API

Créer une route par domaine métier.

Exemples :

```text
/api/students
/api/documents
/api/adapt
/api/feedback
/api/admin/prompts
/api/admin/prompts/test
```

Interdit :

```text
/api/all
```

---

## Services IA

Créer un service par capacité :

```text
services/ai/adaptation.ai.service.ts
services/ai/quiz.ai.service.ts
services/ai/mindmap.ai.service.ts
services/ai/audio.ai.service.ts
services/ai/feedback.ai.service.ts
```

Ne jamais créer un `ai.service.ts` géant.

---

## Connecteurs futurs

Préparer l’architecture pour :

* Moodle
* SharePoint
* Teams
* Google Classroom
* Google Drive

Créer des abstractions dans :

```text
services/connectors/
```

Ne pas coupler le cœur produit à un connecteur spécifique.

---

## UX produit

Le parcours principal doit rester très simple :

```text
Importer un document
↓
Choisir un élève
↓
Adapter
↓
Télécharger / partager
```

Objectif :

> obtenir une adaptation exploitable en moins de 60 secondes.

---

## Mode démonstration

Si `OPENAI_API_KEY` est absente :

* activer le mode démo ;
* ne pas bloquer l’application ;
* afficher clairement que le résultat est simulé.

---

## Règle finale

À chaque modification, l’agent doit :

1. expliquer brièvement ce qu’il va changer ;
2. identifier les risques de régression ;
3. modifier le minimum de fichiers nécessaires ;
4. respecter l’architecture ;
5. ajouter ou mettre à jour les tests utiles ;
6. vérifier que le build reste compatible Vercel.

<!-- END:nextjs-agent-rules -->
