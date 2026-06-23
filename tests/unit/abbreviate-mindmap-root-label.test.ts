import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  abbreviateMindmapRootLabel,
  MINDMAP_ROOT_LABEL_MAX_LENGTH,
} from "../../src/lib/mermaid/abbreviate-mindmap-root-label.ts";

describe("abbreviateMindmapRootLabel", () => {
  it("conserve un titre court", () => {
    assert.equal(abbreviateMindmapRootLabel("Bilan"), "Bilan");
  });

  it("abrège un titre long par mots", () => {
    const abbreviated = abbreviateMindmapRootLabel("Gestion Financière");
    assert.ok(abbreviated.length <= MINDMAP_ROOT_LABEL_MAX_LENGTH);
    assert.match(abbreviated, /Gestion/i);
  });

  it("utilise des initiales si nécessaire", () => {
    const abbreviated = abbreviateMindmapRootLabel(
      "Organisation des activités économiques internationales",
    );
    assert.ok(abbreviated.length <= MINDMAP_ROOT_LABEL_MAX_LENGTH);
  });

  it("retourne Idée pour une chaîne vide", () => {
    assert.equal(abbreviateMindmapRootLabel("   "), "Idée");
  });
});
