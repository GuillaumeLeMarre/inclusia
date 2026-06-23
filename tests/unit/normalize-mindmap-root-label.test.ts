import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MINDMAP_ROOT_LABEL_MAX_LENGTH } from "../../src/lib/mermaid/abbreviate-mindmap-root-label.ts";
import { normalizeMindmapRootLabel } from "../../src/lib/mermaid/normalize-mindmap-root-label.ts";

describe("normalizeMindmapRootLabel", () => {
  it("remplace root((root)) par le titre du schéma (abrégé si long)", () => {
    const code = `mindmap
  root((root))
    Passifs
      Dettes`;

    const normalized = normalizeMindmapRootLabel(code, "Gestion Financière");
    const match = normalized.match(/root\(\((.*?)\)\)/);
    assert.ok(match);
    assert.ok(match[1]!.length <= MINDMAP_ROOT_LABEL_MAX_LENGTH);
    assert.doesNotMatch(normalized, /root\(\(root\)\)/i);
  });

  it("remplace un nœud central root seul", () => {
    const code = `mindmap
  root
    Branche A`;

    const normalized = normalizeMindmapRootLabel(code, "Mon cours");
    assert.match(normalized, /root\(\(Mon cours\)\)/);
  });

  it("abrège un libellé central déjà explicite s'il est trop long", () => {
    const code = `mindmap
  root((Organisation des activités économiques))
    Bilan`;

    const normalized = normalizeMindmapRootLabel(code, "Gestion Financière");
    const match = normalized.match(/root\(\((.*?)\)\)/);
    assert.ok(match);
    assert.ok(match[1]!.length <= MINDMAP_ROOT_LABEL_MAX_LENGTH);
    assert.doesNotMatch(normalized, /Organisation des activités économiques/);
  });

  it("conserve un libellé central court", () => {
    const code = `mindmap
  root((États financiers))
    Bilan`;

    const normalized = normalizeMindmapRootLabel(code, "Gestion Financière");
    assert.match(normalized, /root\(\(États financiers\)\)/);
  });

  it("laisse les autres types de diagrammes inchangés", () => {
    const code = `flowchart TD
  root --> A`;
    assert.equal(normalizeMindmapRootLabel(code, "Titre"), code);
  });
});
