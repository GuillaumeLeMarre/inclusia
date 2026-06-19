import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseInlineMarkdown,
  parseMarkdownBlocks,
} from "../../src/lib/pdf/parse-markdown-for-pdf.ts";
import { buildAdaptationPdfBuffer } from "../../src/services/adaptation/adaptation-pdf.service.ts";

describe("parseInlineMarkdown", () => {
  it("parse le gras et l'italique", () => {
    const spans = parseInlineMarkdown("Le **soleil** est *chaud*.");
    assert.ok(spans.some((s) => s.bold && s.text === "soleil"));
    assert.ok(spans.some((s) => s.italic && s.text === "chaud"));
  });
});

describe("parseMarkdownBlocks", () => {
  it("parse titres, listes et citations", () => {
    const md = `## Titre

Paragraphe avec **gras**.

- Premier point
- Deuxième point

> Citation importante`;

    const blocks = parseMarkdownBlocks(md);
    assert.equal(blocks[0]?.type, "heading");
    assert.equal(blocks[1]?.type, "paragraph");
    assert.equal(blocks[2]?.type, "ul");
    assert.equal(blocks[3]?.type, "blockquote");
  });

  it("parse les listes numérotées", () => {
    const blocks = parseMarkdownBlocks("1. Un\n2. Deux");
    assert.equal(blocks[0]?.type, "ol");
    if (blocks[0]?.type === "ol") {
      assert.equal(blocks[0].items.length, 2);
      assert.equal(blocks[0].items[0]?.number, 1);
      assert.equal(blocks[0].items[1]?.number, 2);
    }
  });

  it("regroupe les listes numérotées séparées par une ligne vide", () => {
    const blocks = parseMarkdownBlocks("1. Un\n\n2. Deux\n\n3. Trois");
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.type, "ol");
    if (blocks[0]?.type === "ol") {
      assert.equal(blocks[0].items.length, 3);
      assert.equal(blocks[0].items[2]?.number, 3);
    }
  });

  it("accepte le format 1) pour les listes numérotées", () => {
    const blocks = parseMarkdownBlocks("1) Un\n2) Deux");
    assert.equal(blocks[0]?.type, "ol");
    if (blocks[0]?.type === "ol") {
      assert.equal(blocks[0].items[1]?.number, 2);
    }
  });
});

describe("buildAdaptationPdfBuffer markdown", () => {
  it("génère un PDF avec contenu markdown structuré", async () => {
    const content = `## Section

Texte **important**.

- Point A
- Point B`;

    const pdf = await buildAdaptationPdfBuffer("Mon cours", content, { falcMode: false });
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
    assert.ok(pdf.length > 500);
  });

  it("intègre un schéma PNG envoyé par le client", async () => {
    const content = `## Cours

Contenu adapté.`;

    const schemaSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="#f0f0f0"/>
      <circle cx="200" cy="100" r="60" fill="#3b82f6"/>
    </svg>`;

    const sharp = (await import("sharp")).default;
    const pngBuffer = await sharp(Buffer.from(schemaSvg)).png().toBuffer();
    const schemaPng = `data:image/png;base64,${pngBuffer.toString("base64")}`;

    const pdfWithoutSchema = await buildAdaptationPdfBuffer("Mon cours", content, {
      falcMode: false,
    });
    const pdfWithSchema = await buildAdaptationPdfBuffer("Mon cours", content, {
      falcMode: false,
      schemaPng,
    });

    assert.equal(pdfWithSchema.subarray(0, 4).toString(), "%PDF");
    assert.ok(pdfWithSchema.length > pdfWithoutSchema.length + 1000);
  });

  it("intègre un schéma SVG en repli", async () => {
    const content = `## Cours

Contenu adapté.

## Schéma

![Carte du cours](schema)`;

    const schemaSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="#f0f0f0"/>
      <circle cx="200" cy="100" r="60" fill="#3b82f6"/>
      <text x="200" y="105" text-anchor="middle" font-size="20" fill="#ffffff">Schéma</text>
    </svg>`;

    const pdfWithoutSchema = await buildAdaptationPdfBuffer("Mon cours", content, {
      falcMode: false,
    });
    const pdfWithSchema = await buildAdaptationPdfBuffer("Mon cours", content, {
      falcMode: false,
      schema: {
        diagramType: "mindmap",
        title: "Carte du cours",
        mermaidCode: "mindmap\n  root((Idée centrale))\n    Branche A\n    Branche B",
        explanation: "Test",
      },
      schemaSvg,
    });

    assert.equal(pdfWithSchema.subarray(0, 4).toString(), "%PDF");
    assert.ok(pdfWithSchema.length > pdfWithoutSchema.length + 1000);
  });
});
