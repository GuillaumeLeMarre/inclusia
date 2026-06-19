import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectDiagramType,
  isValidMermaidStructure,
  sanitizeMermaidCode,
} from "../../src/lib/mermaid/mermaid-utils.ts";
import { generateDemoMermaid } from "../../src/services/mindmap/demo-mermaid.service.ts";

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

  it("détecte un graph TD", () => {
    assert.equal(detectDiagramType("graph TD\n  A --> B"), "graph TD");
  });
});

describe("isValidMermaidStructure", () => {
  it("accepte les formats supportés", () => {
    assert.equal(isValidMermaidStructure("mindmap\n  a"), true);
    assert.equal(isValidMermaidStructure("texte libre"), false);
  });
});

describe("generateDemoMermaid", () => {
  it("produit un code Mermaid valide", () => {
    const result = generateDemoMermaid("# La Révolution\nContenu du cours");
    assert.equal(result.diagramType, "mindmap");
    assert.ok(isValidMermaidStructure(result.mermaidCode));
    assert.ok(result.mermaidCode.includes("mindmap"));
  });
});

describe("convertMindmapJsonToMermaid", () => {
  it("convertit le JSON legacy en graph TD", async () => {
    const { convertMindmapJsonToMermaid } = await import(
      "../../src/lib/mermaid/convert-mindmap-json.ts"
    );
    const code = convertMindmapJsonToMermaid({
      nodes: [
        { id: "1", label: "Sujet" },
        { id: "2", label: "Idée A" },
      ],
      links: [{ source: "1", target: "2" }],
    });
    assert.ok(code.includes("graph TD"));
    assert.ok(isValidMermaidStructure(code));
  });
});
