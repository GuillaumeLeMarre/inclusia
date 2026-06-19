import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanAdaptationContent } from "../../src/lib/adaptations/clean-adaptation-content.ts";
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
});

describe("getAdaptationContainerClasses", () => {
  it("contraste élevé avec fond distinct", () => {
    const classes = getAdaptationContainerClasses("high-contrast");
    assert.ok(classes.includes("bg-white"));
    assert.ok(classes.includes("text-black"));
  });
});
