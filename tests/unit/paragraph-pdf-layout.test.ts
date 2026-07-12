import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  countLinesForPageChunk,
  MIN_PARAGRAPH_LINES_TOGETHER,
  shouldStartBlockOnFreshPage,
} from "../../src/lib/pdf/paragraph-pdf-layout.ts";

describe("paragraph-pdf-layout", () => {
  it("garde au moins deux lignes ensemble quand il reste du texte", () => {
    assert.equal(countLinesForPageChunk(5, 1), 0);
    assert.equal(countLinesForPageChunk(5, 2), 2);
    assert.equal(countLinesForPageChunk(5, 4), 3);
    assert.equal(countLinesForPageChunk(3, 2), 0);
  });

  it("autorise les paragraphes courts sur une page", () => {
    assert.equal(countLinesForPageChunk(1, 1), 1);
    assert.equal(countLinesForPageChunk(2, 1), 2);
    assert.equal(MIN_PARAGRAPH_LINES_TOGETHER, 2);
  });

  it("déplace un bloc entier sur la page suivante s'il tient mais pas dans l'espace restant", () => {
    assert.equal(shouldStartBlockOnFreshPage(120, 80, 700), true);
    assert.equal(shouldStartBlockOnFreshPage(120, 140, 700), false);
    assert.equal(shouldStartBlockOnFreshPage(800, 700, 700), false);
  });
});
