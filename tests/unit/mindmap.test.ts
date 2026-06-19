import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectDiagramType,
  isValidMermaidStructure,
  reconcileDiagramType,
  sanitizeMermaidCode,
} from "../../src/lib/mermaid/mermaid-utils.ts";
import { inferDiagramTypeFromText } from "../../src/lib/mermaid/infer-diagram-type.ts";
import {
  cleanJsonResponse,
  parseMermaidAiResponse,
  serializeMindmapResult,
  deserializeMindmapResult,
} from "../../src/lib/mermaid/parse-mermaid-response.ts";
import {
  generateDemoMermaid,
  generateDemoMermaidForType,
} from "../../src/services/mindmap/demo-mermaid.service.ts";

describe("sanitizeMermaidCode", () => {
  it("retire les fences markdown", () => {
    const raw = "```mermaid\nmindmap\n  root((Test))\n```";
    assert.equal(sanitizeMermaidCode(raw), "mindmap\n  root((Test))");
  });
});

describe("detectDiagramType", () => {
  it("détecte une mindmap", () => {
    assert.equal(detectDiagramType("mindmap\n  root((A))"), "mindmap");
  });

  it("détecte une timeline", () => {
    assert.equal(detectDiagramType("timeline\n  title Histoire"), "timeline");
  });

  it("détecte un graph", () => {
    assert.equal(detectDiagramType("graph TD\n  A --> B"), "graph");
  });

  it("détecte un flowchart", () => {
    assert.equal(detectDiagramType("flowchart TD\n  A --> B"), "flowchart");
  });

  it("détecte une concept_map via liens nommés", () => {
    const code = 'graph TD\n  A -- "cause" --> B';
    assert.equal(detectDiagramType(code), "concept_map");
  });
});

describe("isValidMermaidStructure", () => {
  it("accepte les formats supportés", () => {
    assert.equal(isValidMermaidStructure("mindmap\n  a"), true);
    assert.equal(isValidMermaidStructure("flowchart TD\n  a --> b"), true);
    assert.equal(isValidMermaidStructure("texte libre"), false);
  });
});

describe("parseMermaidAiResponse", () => {
  it("parse un JSON IA valide", () => {
    const raw = JSON.stringify({
      diagramType: "timeline",
      title: "La Révolution",
      mermaidCode: "timeline\n  title La Révolution\n  section X\n    Événement",
      explanation: "Le cours contient des dates.",
    });
    const result = parseMermaidAiResponse(raw);
    assert.ok(result);
    assert.equal(result?.diagramType, "timeline");
    assert.equal(result?.title, "La Révolution");
  });

  it("fallback sur Mermaid brut si JSON invalide", () => {
    const raw = "mindmap\n  root((Test))\n    Branche";
    const result = parseMermaidAiResponse(raw);
    assert.ok(result);
    assert.equal(result?.diagramType, "mindmap");
  });
});

describe("serialize / deserialize", () => {
  it("conserve title et explanation", () => {
    const payload = {
      diagramType: "graph" as const,
      title: "Cycle de l'eau",
      mermaidCode: "graph TD\n  A --> B",
      explanation: "Processus cyclique.",
    };
    const stored = serializeMindmapResult(payload);
    const restored = deserializeMindmapResult(stored);
    assert.deepEqual(restored, payload);
  });
});

describe("inferDiagramTypeFromText", () => {
  it("cours d'histoire avec dates → timeline", () => {
    const text =
      "En 1789 commence la Révolution. En 1792 la monarchie tombe. En 1804 Napoléon devient empereur.";
    assert.equal(inferDiagramTypeFromText(text), "timeline");
  });

  it("cours de SVT avec cycle → graph", () => {
    const text =
      "Le cycle de l'eau : évaporation, condensation, précipitations. Cause et conséquence du réchauffement.";
    assert.equal(inferDiagramTypeFromText(text), "graph");
  });

  it("cours de français avec notion centrale → mindmap", () => {
    const text =
      "Le thème du roman : définition, personnages, intrigue. Vocabulaire clé et idée principale du chapitre.";
    assert.equal(inferDiagramTypeFromText(text), "mindmap");
  });

  it("méthode de résolution mathématique → flowchart", () => {
    const text =
      "Méthode : d'abord lire l'énoncé, ensuite identifier les données, puis appliquer la formule, enfin vérifier.";
    assert.equal(inferDiagramTypeFromText(text), "flowchart");
  });

  it("texte court → mindmap fallback", () => {
    assert.equal(inferDiagramTypeFromText("Le soleil."), "mindmap");
  });
});

describe("generateDemoMermaid", () => {
  it("produit une mindmap valide par défaut", () => {
    const result = generateDemoMermaid("Notions de grammaire");
    assert.equal(result.diagramType, "mindmap");
    assert.ok(isValidMermaidStructure(result.mermaidCode));
    assert.ok(result.explanation.length > 0);
  });

  it("génère une timeline pour l'histoire", () => {
    const result = generateDemoMermaidForType(
      "1789 1792 1804 Révolution française",
      "timeline",
    );
    assert.equal(result.diagramType, "timeline");
    assert.ok(result.mermaidCode.includes("timeline"));
  });
});

describe("reconcileDiagramType", () => {
  it("aligne le type déclaré sur le code Mermaid", () => {
    const code = "flowchart TD\n  A --> B";
    assert.equal(reconcileDiagramType("graph", code), "flowchart");
  });
});

describe("cleanJsonResponse", () => {
  it("extrait le JSON d'une réponse entourée de fences", () => {
    const raw = '```json\n{"diagramType":"mindmap","title":"T","mermaidCode":"mindmap\\n  root((A))","explanation":"x"}\n```';
    const cleaned = cleanJsonResponse(raw);
    assert.ok(cleaned.startsWith("{"));
  });
});

describe("fixTimelineAxisPosition", () => {
  it("détecte une timeline Mermaid", async () => {
    const { isTimelineDiagram } = await import("../../src/lib/mermaid/fix-timeline-layout.ts");
    assert.equal(isTimelineDiagram("timeline\n  title X\n  1789 : evt"), true);
    assert.equal(isTimelineDiagram("mindmap\n  root((A))"), false);
  });
});

describe("convertMindmapJsonToMermaid", () => {
  it("convertit le JSON legacy en graph TD", async () => {
    const { convertMindmapJsonToMermaid } = await import(
      "../../src/lib/mermaid/convert-mindmap-json.ts"
    );
    const code = convertMindmapJsonToMermaid({
      nodes: [
        { id: "a", label: "Sujet" },
        { id: "b", label: "Idée A" },
      ],
      links: [{ source: "a", target: "b" }],
    });
    assert.ok(code.includes("graph TD"));
    assert.ok(isValidMermaidStructure(code));
  });
});

describe("buildMindmapSourceText", () => {
  it("priorise résumé et fiche mémoire", async () => {
    const { buildMindmapSourceText } = await import(
      "../../src/lib/mermaid/build-mindmap-source.ts"
    );
    const text = buildMindmapSourceText({
      summary: "Résumé court",
      memory_sheet: "Points clés",
      adapted_content: "x".repeat(5000),
    } as never);
    assert.ok(text.startsWith("Résumé court"));
    assert.ok(text.includes("Points clés"));
    assert.ok(text.length <= 2400);
  });
});
