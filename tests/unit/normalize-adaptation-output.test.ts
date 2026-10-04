import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeAdaptationOutput } from "../../src/lib/adaptations/normalize-adaptation-output.ts";

describe("normalizeAdaptationOutput", () => {
  it("convertit un memory_sheet renvoyé en tableau en puces Markdown", () => {
    const output = normalizeAdaptationOutput({
      adapted_content: "# Cours",
      memory_sheet: ["L'eau s'évapore", "- La vapeur se condense"],
    });
    assert.equal(output.memory_sheet, "- L'eau s'évapore\n- La vapeur se condense");
    assert.equal(output.memory_sheet.trim().length > 0, true);
  });

  it("conserve les champs texte déjà valides", () => {
    const output = normalizeAdaptationOutput({ summary: "Résumé", audio_script: "Script" });
    assert.equal(output.summary, "Résumé");
    assert.equal(output.audio_script, "Script");
  });

  it("remplace les champs absents par des valeurs vides sûres", () => {
    const output = normalizeAdaptationOutput({});
    assert.equal(output.memory_sheet, "");
    assert.equal(output.adapted_instructions, "");
    assert.deepEqual(output.simplified_questions, []);
    assert.deepEqual(output.keywords, []);
  });

  it("transforme des questions renvoyées en texte en liste", () => {
    const output = normalizeAdaptationOutput({ simplified_questions: "- Qu'est-ce que l'évaporation ?\n- Où va la pluie ?" });
    assert.deepEqual(output.simplified_questions, ["Qu'est-ce que l'évaporation ?", "Où va la pluie ?"]);
  });
});
