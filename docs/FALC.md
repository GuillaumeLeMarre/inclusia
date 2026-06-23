# Module FALC — Facile à Lire et à Comprendre

Inclusia intègre le FALC comme **niveau d'adaptation natif** et comme **profil pédagogique** (`falc`).

## Niveaux d'adaptation

| Valeur | UI | Description |
|--------|-----|-------------|
| `standard` | Standard | Adaptation légère |
| `simplified` | Simplifié | Adaptation pédagogique renforcée |
| `falc` | FALC | Facile à Lire et à Comprendre |

Sélection dans l'assistant d'adaptation (étape 4) via `AdaptationLevelSelector`.

## Modèle de données

Migration `supabase/migrations/007_falc.sql` :

- `adaptations.adaptation_level` — `standard | simplified | falc`
- `adaptations.falc_score` — score qualité 0–100
- `adaptations.falc_content` — contenu FALC généré
- `adaptations.generate_pictograms` — active la génération ARASAAC
- `adaptations.falc_pictograms` — pictogrammes générés (JSON)

Profil seed : `adaptation_profiles.slug = 'falc'`.

## Pictogrammes ARASAAC

Lorsque **Générer des pictogrammes** est coché :

1. Extraction des concepts (IA OpenAI si disponible, sinon heuristique Markdown)
2. Recherche sur [ARASAAC](https://arasaac.org/) (API publique, locale `fr`)
3. Stockage dans `falc_pictograms`
4. Affichage en grille + onglet **Pictogrammes**
5. **Inline dans le cours** : pictogramme à gauche de chaque mot en **gras** correspondant

### Choix des mots en gras et des pictogrammes

| Étape | Responsable | Règle |
|-------|-------------|-------|
| Gras dans le texte | IA FALC (`FALC_SYSTEM_PROMPT`) | Mots importants du corps en `**gras**` ; titre principal en `##` |
| Concepts à illustrer | IA (`pictogram.prompt.ts`) ou heuristique | 6–12 concepts : mots-clés, titres `##`, texte en gras, puces |
| Image ARASAAC | API + `arasaac-match.ts` | Correspondance **exacte** du mot (singulier/pluriel proche uniquement) |
| Affichage inline | `pictogram-lookup.ts` | Un pictogramme s’affiche seulement si le mot gras correspond **exactement** au concept stocké |

Correspondances floues interdites (ex. « biens » ≠ « amphibiens »). Fichiers : `keyword-match.ts`, `pictogram-lookup.ts`, `inline-pictogram-strong.tsx`.

Pour regénérer après correction : bouton **Régénérer** dans le panneau Pictogrammes.

### API pictogrammes

`POST /api/falc/pictograms`

```json
{ "adaptationId": "uuid", "forceRegenerate": false }
```

Réponse : objet `FalcPictogramsData` avec `items[]` (`id`, `keyword`, `label`, `imageUrl`, `source: "arasaac"`).

Migration : `008_falc_pictograms.sql`.

## Architecture

```
src/features/falc/          — UI (sélecteur, badge, export, pictogrammes placeholder)
src/services/ai/falc.ai.service.ts   — génération IA + validation
src/services/falc/          — orchestration + export PDF
src/lib/falc/               — validateur et libellés de score
src/prompts/falc/           — prompt système FALC
src/app/api/falc/           — API génération et export PDF
```

## Moteur FALC

`generateFalcFromText()` :

1. Envoie le contenu au modèle avec `FALC_SYSTEM_PROMPT`
2. Valide le résultat via `validateFalcContent()`
3. Retourne `{ content, score, label, metrics }`

### Règles appliquées (prompt + validateur)

- Phrases courtes (cible ≤ 12 mots)
- Une idée par phrase
- Vocabulaire courant, mots difficiles expliqués
- Voix active, paragraphes courts, listes à puces
- Exemples concrets ; éviter doubles négations, métaphores, implicites
- **Titre principal** : une seule ligne en `## Titre` en tête du document (pas de `**titre**` seul en première ligne)
- Markdown simple : titres `##`, listes `-`, gras réservé aux mots importants dans le corps

### Score FALC (/100)

| Score | Label | Emoji |
|-------|-------|-------|
| ≥ 85 | Excellent | 🟢 |
| 70–84 | Bon | 🟡 |
| < 70 | À améliorer | 🔴 |

Métriques : longueur moyenne des phrases, mots complexes (≥ 9 lettres), phrases passives, densité.

## API

### `POST /api/falc`

```json
{ "adaptationId": "uuid", "forceRegenerate": false }
```

Réponse :

```json
{
  "content": "...",
  "score": 92,
  "label": "Excellent",
  "metrics": { ... }
}
```

### `POST /api/falc/export`

Export PDF FALC (grande police, espacement, listes aérées, schémas Mermaid).

Même moteur que `/api/adaptations/export` avec `falcMode: true`. Voir **[docs/PDF_EXPORT.md](PDF_EXPORT.md)** pour le détail du pipeline.

## Interface résultat

- Badge **FALC** dans les métadonnées
- `FalcScoreBadge` : score et label
- `FalcExportButton` : téléchargement PDF
- Cours adapté affiche `falc_content` avec thème lecture **FALC**
- **Pictogrammes** : grille ARASAAC + onglet dédié si `generate_pictograms`
- Carte « Cours adapté » : le contenu markdown, pas le nom du fichier source
- **Pictogrammes inline** : sur les mots en **gras** du cours FALC (ARASAAC), avec récap dans l’onglet Pictogrammes

## Titre du cours (web et PDF)

Le **premier titre du contenu** (pas le nom du document importé) est mis en avant :

| Support | Détection | Style |
|---------|-----------|-------|
| Web | `## Titre` ou `**Titre**` seul (1re ligne) | Centré, gras, grande taille, sans soulignement |
| PDF | Même logique via `isCourseTitle` | Centré, gras, sans soulignement |

Fichiers : `reading-mode-styles.ts`, `adaptation-markdown-components.tsx`, `markdown-html-utils.ts` (`findFirstCourseTitleLocation`), `parse-markdown-for-pdf.ts`, `markdown-pdf-renderer.ts`.

Le titre est repéré par **numéro de ligne** dans le markdown (évite les erreurs d’hydratation React SSR/client).

## Thème accessibilité FALC

Mode lecture `falc` : `text-lg leading-9 max-w-3xl tracking-wide`, contraste renforcé.

Configurable aussi dans Paramètres (mode lecture global).

## Schémas (mode FALC)

Lorsque `adaptation_level === 'falc'` :

- Source schéma : `falc_content` prioritaire
- Prompt Mermaid : mindmap/timeline simples, **max 10 nœuds**, libellés 2–4 mots

## Roadmap V2 (abstractions partielles)

`src/features/falc/types/falc-roadmap.ts` :

- `FalcPictogramProvider` — implémenté via ARASAAC
- `FalcAudioProvider` — non implémenté
- `FalcInteractiveSchemaProvider` — non implémenté

## Tests

```bash
npm run test:unit
```

Fichiers : `tests/unit/falc.test.ts`, `tests/unit/pictograms.test.ts`, `tests/unit/pictogram-lookup.test.ts`, `tests/unit/markdown-pdf.test.ts`, `tests/unit/adaptation-renderer.test.ts`.

Composants inline : `inline-pictogram-strong.tsx`, `pictogram-lookup.ts`, `keyword-match.ts`.

## Migration

Appliquer dans Supabase (SQL Editor ou `supabase db push`) :

- `007_falc.sql` — niveau FALC, score, contenu
- `008_falc_pictograms.sql` — colonne `falc_pictograms`
