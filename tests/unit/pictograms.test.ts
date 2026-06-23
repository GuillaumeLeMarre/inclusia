import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractPictogramConcepts } from "../../src/lib/falc/extract-pictogram-concepts.ts";
import {
  getArasaacPictogramUrl,
  getArasaacSearchUrl,
} from "../../src/lib/pictograms/arasaac-url.ts";
import {
  pickBestArasaacResult,
  scoreArasaacMatch,
} from "../../src/lib/pictograms/arasaac-match.ts";

describe("extractPictogramConcepts", () => {
  it("extrait les titres, mots en gras et mots-clés", () => {
    const content = `## Le soleil
- Le soleil **chauffe** la Terre.
- La **Terre** tourne autour du soleil.`;

    const concepts = extractPictogramConcepts(content, [
      { term: "planète", definition: "Corps céleste" },
    ]);

    assert.ok(concepts.includes("le soleil") || concepts.includes("soleil"));
    assert.ok(concepts.some((c) => c.includes("chauffe") || c.includes("terre")));
    assert.ok(concepts.includes("planète"));
    assert.ok(concepts.length <= 12);
  });
});

describe("getArasaacPictogramUrl", () => {
  it("construit l'URL static ARASAAC", () => {
    assert.equal(
      getArasaacPictogramUrl(7252),
      "https://static.arasaac.org/pictograms/7252/7252_500.png",
    );
  });

  it("construit l'URL de recherche", () => {
    assert.equal(
      getArasaacSearchUrl("soleil"),
      "https://api.arasaac.org/api/pictograms/fr/search/soleil",
    );
  });
});

describe("pickBestArasaacResult", () => {
  it("privilégie la correspondance exacte et schematic", () => {
    const results = [
      {
        _id: 1,
        schematic: false,
        keywords: [{ keyword: "rayon de soleil", type: 2 }],
      },
      {
        _id: 7252,
        schematic: true,
        aac: true,
        keywords: [{ keyword: "soleil", type: 1 }],
      },
    ];

    const best = pickBestArasaacResult(results, "soleil");
    assert.equal(best?._id, 7252);
    assert.ok(scoreArasaacMatch(best!, "soleil") > scoreArasaacMatch(results[0]!, "soleil"));
  });

  it("ne confond pas biens et amphibiens à la génération", () => {
    const results = [
      {
        _id: 99,
        schematic: true,
        aac: true,
        keywords: [{ keyword: "amphibiens", type: 1 }],
      },
      {
        _id: 42,
        schematic: false,
        keywords: [{ keyword: "bien", type: 1 }],
      },
    ];

    const best = pickBestArasaacResult(results, "biens");
    assert.equal(best?._id, 42);
    assert.equal(scoreArasaacMatch(results[0]!, "biens"), 0);
  });
});
