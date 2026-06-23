# Export PDF des cours adaptés

Inclusia permet de télécharger le cours adapté (standard, simplifié ou FALC) au format PDF, avec schémas Mermaid intégrés et mise en forme Markdown fidèle à l’affichage web.

## Points d’entrée

| Contexte | Bouton | Route API |
|----------|--------|-----------|
| Cours adapté | `AdaptationExportButton` | `POST /api/adaptations/export` |
| FALC | `FalcExportButton` | `POST /api/falc/export` |

Les deux routes s’appuient sur le même moteur serveur : `buildAdaptationPdfBuffer()` dans `src/services/adaptation/adaptation-pdf.service.ts`.

## Flux client → serveur

```
AdaptationExportButton / FalcExportButton
  └─ export-adaptation-pdf-client.ts
       ├─ capture SVG du schéma affiché (DOM)
       ├─ repli : rendu Mermaid navigateur → PNG (svg-to-png-browser.ts)
       └─ POST { adaptationId, schemaPng?, schemaSvg? }
            └─ buildAdaptationPdfBuffer(content, options)
                 ├─ parseMarkdownBlocks()
                 ├─ renderMarkdownBlocksToPdf()
                 └─ schéma : PNG client prioritaire, SVG serveur en repli
```

Composant hors écran pour pré-capturer le schéma : `SchemaExportRenderer` (`src/features/adaptations/components/schema-export-renderer.tsx`).

## Contenu exporté

- **Standard / simplifié** : `adaptations.adapted_content`
- **FALC** : `adaptations.falc_content` (si présent)

Le **nom du fichier source** (`document.title`) n’apparaît pas comme titre dans le PDF. Seul le **premier titre du contenu markdown** est mis en forme comme titre de cours (voir ci-dessous).

## Titre du cours (HTML et PDF alignés)

Le premier titre du contenu est détecté automatiquement :

| Format markdown | Exemple | Usage |
|-----------------|---------|-------|
| Titre `##` | `## La Révolution française` | **Recommandé** (prompt FALC) |
| Paragraphe gras seul | `**La Révolution française**` | Repli FALC (contenus existants) |

### Affichage web

- Fichiers : `adaptation-markdown-components.tsx`, `reading-mode-styles.ts`, `markdown-html-utils.ts`
- Style : centré, gras, grande taille, **sans soulignement**
- Les titres suivants (`##`, `###`) restent alignés à gauche

### Affichage PDF

- Parser : `parse-markdown-for-pdf.ts` → flag `isCourseTitle` sur le premier bloc titre ou paragraphe gras seul
- Renderer : `markdown-pdf-renderer.ts` → `renderCourseTitleBlock()` (centré, gras, sans soulignement)
- Pas d’en-tête séparé avec le nom du document

## Éléments Markdown supportés

- Titres `#` à `######`
- Paragraphes, **gras**, *italique*, `code`
- Listes à puces (`-`, `*`)
- Listes numérotées (`1.`, `1)`) — regroupement même avec lignes vides entre items
- Citations (`>`)
- Séparateurs (`---`)
- Placeholder schéma : `![label](schema)` ou injection automatique en fin de document

## Schémas Mermaid

1. **Priorité** : PNG base64 capturé côté client (`schemaPng`) — SVG du DOM ou rendu Mermaid, puis conversion canvas.
2. **Repli client** : SVG brut (`schemaSvg`).
3. **Repli serveur** : conversion SVG → PNG via `sharp` (`schema-pdf-image.ts`).

Mermaid est initialisé avec `htmlLabels: false` (labels SVG natifs, pas `foreignObject`). Avant rasterisation, `prepare-mermaid-svg-for-rasterization.ts` convertit les anciens labels HTML en `<text>`, inline les couleurs CSS des mindmaps et centre le libellé du nœud central.

### Nœud central des mindmaps

Le libellé « root » est remplacé par le **titre du schéma** (`normalize-mindmap-root-label.ts`). Les titres longs sont **abrégés** pour tenir dans la bulle centrale (`abbreviate-mindmap-root-label.ts`, max ~18 caractères : mots raccourcis, puis initiales).

| Étape | Fichier |
|-------|---------|
| Normalisation du code Mermaid | `normalize-mindmap-root-label.ts` |
| Abréviation du titre | `abbreviate-mindmap-root-label.ts` |
| Centrage du texte dans le nœud | `center-mindmap-root-label.ts` |
| Affichage web | `MermaidRenderer.tsx` (`rootLabel`) |
| Export PNG/PDF | `prepare-mermaid-svg-for-rasterization.ts`, `svg-to-png-browser.ts` |

Le titre complet reste visible **au-dessus** du schéma (légende / panneau) ; seul le libellé **dans la bulle centrale** est abrégé si nécessaire.

Le schéma est inséré comme bloc `schema` dans le PDF avec le libellé du mindmap ou « Schéma du cours ».

**Mise en page** : le titre `## Schéma`, le paragraphe d’introduction et l’image forment un bloc indivisible. S’ils ne tiennent pas sur la page courante, un saut de page est ajouté avant le titre pour les garder ensemble.

## Thème FALC dans le PDF

Quand `falcMode: true` :

- Police corps plus grande, interlignage augmenté
- Titre de cours : 22 pt (vs 20 pt en standard)
- Listes et paragraphes plus aérés

## Fichiers clés

```
src/
├── lib/mermaid/
│   ├── mermaid-init-config.ts              # htmlLabels: false
│   ├── normalize-mindmap-root-label.ts     # Titre à la place de « root »
│   ├── abbreviate-mindmap-root-label.ts    # Titres longs → abréviations
│   ├── center-mindmap-root-label.ts        # Centrage nœud central
│   └── prepare-mermaid-svg-for-rasterization.ts
├── lib/pdf/
│   ├── parse-markdown-for-pdf.ts    # Parsing + isCourseTitle
│   ├── markdown-pdf-renderer.ts     # Rendu jsPDF
│   ├── schema-pdf-image.ts          # Image schéma
│   ├── resolve-export-schema.ts     # Schéma depuis l’adaptation
│   ├── adaptation-export-filename.ts # Nom de fichier export
│   ├── schema-section-pdf-layout.ts  # Bloc schéma indivisible (saut de page)
│   └── export-adaptation-pdf-client.ts
├── services/adaptation/
│   └── adaptation-pdf.service.ts    # Orchestration PDF
└── app/api/
    ├── adaptations/export/route.ts
    └── falc/export/route.ts
```

## Tests

```bash
npm run test:unit
```

Fichiers concernés :

- `tests/unit/markdown-pdf.test.ts` — parsing, listes numérotées, titre de cours, génération PDF
- `tests/unit/adaptation-pdf.test.ts` — buffers FALC / standard
- `tests/unit/adaptation-renderer.test.ts` — titre centré HTML (## et gras seul)
- `tests/unit/prepare-mermaid-svg.test.ts` — rasterisation SVG Mermaid
- `tests/unit/normalize-mindmap-root-label.test.ts` — titre central mindmap
- `tests/unit/abbreviate-mindmap-root-label.test.ts` — abréviations

## API

### `POST /api/adaptations/export`

```json
{
  "adaptationId": "uuid",
  "schemaPng": "data:image/png;base64,...",
  "schemaSvg": "<svg>...</svg>"
}
```

Réponse : fichier PDF (`Content-Type: application/pdf`).

**Nom du fichier** : titre du document source (`document.title`), ex. `La Révolution française.pdf` ou `La Révolution française - FALC.pdf`. Utilitaire : `adaptation-export-filename.ts`.

Les champs `schemaPng` et `schemaSvg` sont optionnels ; le client les envoie lorsqu’un schéma est disponible à l’écran. Le navigateur récupère le nom via l’en-tête `Content-Disposition`.
