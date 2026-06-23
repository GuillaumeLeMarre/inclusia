import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildPictogramLookup,
  findPictogramForText,
  normalizePictogramKeyword,
} from "../../src/lib/falc/pictogram-lookup.ts";
import type { FalcPictogramItem } from "../../src/types/falc.ts";

const soleilItem: FalcPictogramItem = {
  id: 7252,
  keyword: "soleil",
  label: "soleil",
  imageUrl: "https://static.arasaac.org/pictograms/7252/7252_500.png",
  source: "arasaac",
};

describe("normalizePictogramKeyword", () => {
  it("normalise la casse et la ponctuation", () => {
    assert.equal(normalizePictogramKeyword("  Terre. "), "terre");
  });
});

describe("findPictogramForText", () => {
  it("retrouve un pictogramme par mot en gras", () => {
    const lookup = buildPictogramLookup([soleilItem]);
    assert.equal(findPictogramForText("soleil", lookup)?.id, 7252);
    assert.equal(findPictogramForText("Soleil", lookup)?.id, 7252);
  });

  it("ne confond pas biens et amphibiens", () => {
    const lookup = buildPictogramLookup([
      {
        id: 99,
        keyword: "amphibiens",
        label: "amphibiens",
        imageUrl: "https://example.com/amphibiens.png",
        source: "arasaac",
      },
    ]);
    assert.equal(findPictogramForText("biens", lookup), null);
  });

  it("accepte le singulier/pluriel proche (bien/biens)", () => {
    const lookup = buildPictogramLookup([
      {
        id: 42,
        keyword: "bien",
        label: "bien",
        imageUrl: "https://example.com/bien.png",
        source: "arasaac",
      },
    ]);
    assert.equal(findPictogramForText("biens", lookup)?.id, 42);
  });
});
