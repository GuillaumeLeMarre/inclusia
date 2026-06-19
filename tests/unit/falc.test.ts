import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeFalcText,
  computeFalcScore,
  validateFalcContent,
} from "../../src/lib/falc/falc-validator.ts";
import { getFalcQualityLabel, getFalcScoreEmoji } from "../../src/lib/falc/falc-score-label.ts";
import { buildAdaptationPdfBuffer } from "../../src/services/adaptation/adaptation-pdf.service.ts";
import { buildMindmapUserPrompt } from "../../src/prompts/mindmap/mindmap.prompt.ts";

const GOOD_FALC = `Le soleil est une étoile.
Il chauffe la Terre.
La Terre tourne autour du soleil.
Une année dure 365 jours.
L'hiver est froid.
L'été est chaud.`;

const BAD_FALC = `La photosynthèse, processus biochimique fondamental par lequel les organismes autotrophes transforment l'énergie lumineuse en énergie chimique, n'est pas un phénomène qui ne pourrait pas être considéré comme essentiel à la survie des écosystèmes terrestres complexes.`;

describe("analyzeFalcText", () => {
  it("calcule une longueur moyenne de phrase raisonnable", () => {
    const metrics = analyzeFalcText(GOOD_FALC);
    assert.ok(metrics.averageWordsPerSentence <= 12);
    assert.ok(metrics.sentenceCount >= 5);
  });

  it("détecte les mots complexes et le passif", () => {
    const metrics = analyzeFalcText(BAD_FALC);
    assert.ok(metrics.complexWordCount > 0);
    assert.ok(metrics.averageWordsPerSentence > 12);
  });
});

describe("computeFalcScore", () => {
  it("attribue un score élevé au texte FALC conforme", () => {
    const metrics = analyzeFalcText(GOOD_FALC);
    const score = computeFalcScore(metrics);
    assert.ok(score >= 80, `score attendu >= 80, obtenu ${score}`);
  });

  it("attribue un score bas au texte complexe", () => {
    const metrics = analyzeFalcText(BAD_FALC);
    const score = computeFalcScore(metrics);
    assert.ok(score < 70, `score attendu < 70, obtenu ${score}`);
  });
});

describe("validateFalcContent", () => {
  it("retourne score, label et métriques", () => {
    const result = validateFalcContent(GOOD_FALC);
    assert.ok(result.score >= 0 && result.score <= 100);
    assert.ok(["Excellent", "Bon", "À améliorer"].includes(result.label));
    assert.ok(result.metrics.wordCount > 0);
  });

  it("classe Excellent pour un score >= 85", () => {
    assert.equal(getFalcQualityLabel(92), "Excellent");
    assert.equal(getFalcScoreEmoji(92), "🟢");
  });
});

describe("phrases courtes FALC", () => {
  it("pénalise les phrases dépassant 12 mots", () => {
    const longSentence = "Un ".repeat(15) + "texte.";
    const metrics = analyzeFalcText(longSentence);
    assert.ok(metrics.averageWordsPerSentence > 12);
    assert.ok(computeFalcScore(metrics) < 100);
  });
});

describe("conservation du sens (heuristique)", () => {
  it("conserve les mots-clés pédagogiques du source", () => {
    const source = "Le soleil chauffe la Terre.";
    const adapted = "Le soleil est chaud.\nIl chauffe la Terre.";
    const sourceWords = source.toLowerCase().split(/\s+/);
    const adaptedLower = adapted.toLowerCase();
    const preserved = sourceWords.filter((w) => adaptedLower.includes(w.replace(/[.!?]/, "")));
    assert.ok(preserved.length >= 2);
  });
});

describe("buildAdaptationPdfBuffer", () => {
  it("produit un buffer PDF FALC non vide", async () => {
    const pdf = await buildAdaptationPdfBuffer("Test FALC", GOOD_FALC, { falcMode: true });
    assert.ok(Buffer.isBuffer(pdf));
    assert.ok(pdf.length > 100);
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  });

  it("produit un buffer PDF standard pour le cours adapté", async () => {
    const pdf = await buildAdaptationPdfBuffer("Cours adapté", GOOD_FALC, { falcMode: false });
    assert.ok(Buffer.isBuffer(pdf));
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  });
});

describe("buildMindmapUserPrompt FALC", () => {
  it("inclut les contraintes FALC et privilégie mindmap/timeline", () => {
    const prompt = buildMindmapUserPrompt("Cours test", "flowchart", { falcMode: true });
    assert.match(prompt, /Mode FALC/i);
    assert.match(prompt, /diagramType: mindmap/);
  });
});

describe("injectFalcSchemaSection", () => {
  it("ajoute une section schéma avec placeholder image", async () => {
    const { injectFalcSchemaSection } = await import("../../src/lib/falc/inject-falc-schema.ts");
    const result = injectFalcSchemaSection("## Cours\n\nTexte simple.", "Le soleil");
    assert.match(result, /## Schéma/);
    assert.match(result, /Ce schéma t'aide à comprendre le cours/);
    assert.match(result, /!\[Le soleil\]\(schema\)/);
  });

  it("ne duplique pas si une image existe déjà", async () => {
    const { injectFalcSchemaSection } = await import("../../src/lib/falc/inject-falc-schema.ts");
    const existing = "Texte\n\n![Schéma](schema)";
    assert.equal(injectFalcSchemaSection(existing, "Titre"), existing);
  });
});
