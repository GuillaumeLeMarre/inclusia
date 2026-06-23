import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAdaptationExportFilename,
  contentDispositionAttachment,
  parseContentDispositionFilename,
  sanitizeExportFilenameBase,
} from "../../src/lib/pdf/adaptation-export-filename.ts";

describe("sanitizeExportFilenameBase", () => {
  it("conserve le titre du document", () => {
    assert.equal(sanitizeExportFilenameBase("La Révolution française"), "La Révolution française");
  });

  it("retire les caractères interdits", () => {
    assert.equal(sanitizeExportFilenameBase('Cours: histoire/géo'), "Cours histoiregéo");
  });

  it("utilise un nom par défaut si vide", () => {
    assert.equal(sanitizeExportFilenameBase("   "), "cours-adapte");
  });
});

describe("buildAdaptationExportFilename", () => {
  it("utilise le titre du document source", () => {
    assert.equal(
      buildAdaptationExportFilename("La Révolution française"),
      "La Révolution française.pdf",
    );
  });

  it("ajoute le suffixe FALC", () => {
    assert.equal(
      buildAdaptationExportFilename("La Révolution française", { falcMode: true }),
      "La Révolution française - FALC.pdf",
    );
  });
});

describe("contentDispositionAttachment", () => {
  it("encode les titres accentués pour Content-Disposition", () => {
    const header = contentDispositionAttachment("La Révolution française.pdf");
    assert.match(header, /filename\*=UTF-8''/);
    assert.equal(
      parseContentDispositionFilename(header),
      "La Révolution française.pdf",
    );
  });
});
