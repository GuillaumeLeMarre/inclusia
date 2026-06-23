import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanAdaptationContent } from "../../src/lib/adaptations/clean-adaptation-content.ts";
import { findFirstCourseTitleLocation } from "../../src/lib/adaptations/markdown-html-utils.ts";
import { getAdaptationContainerClasses } from "../../src/lib/adaptations/reading-mode-styles.ts";
import { AdaptationMarkdownView } from "../../src/components/adaptations/AdaptationMarkdownView.tsx";
import { createElement } from "react";

describe("cleanAdaptationContent", () => {
  it("retire les fences markdown", () => {
    const raw = "```markdown\n**Contexte**\n\nTexte\n```";
    assert.equal(cleanAdaptationContent(raw), "**Contexte**\n\nTexte");
  });

  it("réduit les sauts de ligne excessifs", () => {
    assert.equal(cleanAdaptationContent("A\n\n\n\nB"), "A\n\nB");
  });
});

describe("findFirstCourseTitleLocation", () => {
  it("repère le premier titre ## par numéro de ligne", () => {
    const content = cleanAdaptationContent("## Gestion Financière\n\nTexte.");
    assert.deepEqual(findFirstCourseTitleLocation(content), {
      kind: "heading",
      line: 1,
    });
  });
});

describe("AdaptationMarkdownView", () => {
  it("rend le gras sans afficher les astérisques brutes", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "**Contexte**\n\nÀ la fin du XVIIIe siècle.",
        mode: "standard",
      }),
    );
    assert.ok(html.includes("<strong"));
    assert.ok(html.includes("Contexte"));
    assert.ok(!html.includes("**Contexte**"));
  });

  it("rend les titres sans afficher ##", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "## Titre du cours\n\nParagraphe.",
        mode: "standard",
      }),
    );
    assert.ok(html.includes("<h3"));
    assert.ok(html.includes("Titre du cours"));
    assert.ok(!html.includes("##"));
  });

  it("affiche une liste avec puces", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "- Premier\n- Deuxième",
        mode: "standard",
      }),
    );
    assert.ok(html.includes("<ul"));
    assert.ok(html.includes("<li"));
    assert.ok(html.includes("Premier"));
    assert.ok(!html.match(/^- Premier/m));
  });

  it("applique le mode dyslexie", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "Texte lisible.",
        mode: "dyslexia",
      }),
    );
    assert.ok(html.includes("font-opendyslexic"));
    assert.ok(html.includes("leading-8"));
  });

  it("remplace les images Markdown par une carte schéma", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "![Frise](https://example.com/img.png)",
        mode: "standard",
        onOpenSchema: () => {},
      }),
    );
    assert.ok(html.includes("Schéma disponible"));
    assert.ok(!html.includes("<img"));
    assert.ok(!html.includes("![Frise]"));
  });

  it("insère le schéma Mermaid inline quand fourni", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "![Frise](https://example.com/img.png)",
        mode: "standard",
        embeddedSchema: {
          diagramType: "timeline",
          title: "La Révolution",
          mermaidCode: "timeline\n  title La Révolution\n  1789 : Début",
          explanation: "Chronologie.",
        },
      }),
    );
    assert.ok(!html.includes("Schéma disponible"));
    assert.ok(html.includes("Frise"));
    assert.ok(html.includes("Frise chronologique"));
  });

  it("ajoute le schéma en fin de contenu si absent du texte et demandé", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "Cours adapté sans image.",
        mode: "standard",
        appendSchemaIfMissing: true,
        embeddedSchema: {
          diagramType: "mindmap",
          title: "Notions clés",
          mermaidCode: "mindmap\n  root((Cours))",
          explanation: "Mindmap.",
        },
      }),
    );
    assert.ok(html.includes("Notions clés"));
    assert.ok(html.includes("Carte mentale"));
  });

  it("style les titres en grands blocs lisibles", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "# Grand titre",
        mode: "standard",
      }),
    );
    assert.match(html, /text-2xl|text-3xl/);
  });

  it("centre et souligne uniquement le premier titre du cours", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "## Titre principal\n\nTexte.\n\n## Section suivante",
        mode: "standard",
      }),
    );
    const firstHeading = html.match(/<h3[^>]*>Titre principal<\/h3>/)?.[0] ?? "";
    const secondHeading = html.match(/<h3[^>]*>Section suivante<\/h3>/)?.[0] ?? "";
    assert.match(firstHeading, /text-center/);
    assert.doesNotMatch(firstHeading, /underline/);
    assert.doesNotMatch(secondHeading, /text-center/);
  });

  it("centre le premier titre en gras seul (format FALC courant)", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "**La Révolution française**\n\n1. La France est dirigée par **Louis XVI**.",
        mode: "falc",
      }),
    );
    assert.match(html, /<p[^>]*text-center[^>]*>\s*<strong[^>]*>La Révolution française<\/strong>/);
    assert.doesNotMatch(html.match(/<p[^>]*text-center[^>]*/)?.[0] ?? "", /underline/);
    assert.doesNotMatch(html.match(/<strong[^>]*>Louis XVI<\/strong>/)?.[0] ?? "", /text-center/);
  });

  it("affiche les pictogrammes inline sur les mots en gras (FALC)", () => {
    const html = renderToStaticMarkup(
      createElement(AdaptationMarkdownView, {
        content: "## Le soleil\n\nLe **soleil** chauffe la Terre.",
        mode: "falc",
        inlinePictograms: [
          {
            id: 7252,
            keyword: "soleil",
            label: "soleil",
            imageUrl: "https://static.arasaac.org/pictograms/7252/7252_500.png",
            source: "arasaac",
          },
        ],
      }),
    );
    assert.ok(html.includes("7252_500.png"));
    assert.ok(html.includes("pictogramme : soleil"));
    assert.match(html, /inline-flex items-center[^"]*align-middle/);
    assert.ok(html.includes(">soleil</strong>"));
  });
});

describe("getAdaptationContainerClasses", () => {
  it("contraste élevé avec fond distinct", () => {
    const classes = getAdaptationContainerClasses("high-contrast");
    assert.ok(classes.includes("bg-white"));
    assert.ok(classes.includes("text-black"));
  });
});
