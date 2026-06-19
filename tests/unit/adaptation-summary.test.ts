import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAdaptationSummary } from "../../src/lib/adaptations/adaptation-summary.ts";
import type { Adaptation } from "../../src/types/index.ts";

function baseAdaptation(overrides: Partial<Adaptation> = {}): Adaptation {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    teacher_id: "t1",
    profile_id: "p1",
    document_id: "d1",
    profile_slugs: ["dyslexie", "tdah"],
    status: "completed",
    adaptation_level: "standard",
    falc_score: null,
    falc_content: null,
    generate_pictograms: false,
    falc_pictograms: null,
    adapted_content: "Contenu",
    summary: "Résumé",
    memory_sheet: null,
    quiz: null,
    keywords: null,
    simplified_questions: null,
    adapted_instructions: null,
    mindmap: null,
    mindmap_mermaid: null,
    audio_script: null,
    processing_time_ms: 1200,
    is_demo: false,
    metadata: {},
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("buildAdaptationSummary", () => {
  it("inclut le profil élève et les pathologies", () => {
    const summary = buildAdaptationSummary(
      baseAdaptation(),
      "Lucas",
      "Le système solaire",
    );

    assert.equal(summary.profileName, "Lucas");
    assert.equal(summary.documentTitle, "Le système solaire");
    assert.equal(summary.profiles.length, 2);
    assert.equal(summary.profiles[0]?.name, "Dyslexie");
    assert.equal(summary.profiles[1]?.name, "TDAH");
    assert.ok(summary.profiles[0]?.measures.length > 0);
  });

  it("ajoute le niveau simplifié et les extras FALC", () => {
    const summary = buildAdaptationSummary(
      baseAdaptation({
        adaptation_level: "falc",
        profile_slugs: ["falc", "dysphasie"],
        falc_score: 92,
        generate_pictograms: true,
        mindmap_mermaid: "{}",
      }),
      "Emma",
    );

    assert.equal(summary.levelLabel, "FALC");
    assert.ok(summary.profiles.some((p) => p.slug === "falc"));
    assert.ok(summary.extras.some((e) => e.includes("Score qualité FALC")));
    assert.ok(summary.extras.some((e) => e.includes("Pictogrammes")));
  });

  it("déduplique les slugs de profil", () => {
    const summary = buildAdaptationSummary(
      baseAdaptation({ profile_slugs: ["tdah", "tdah"] }),
    );
    assert.equal(summary.profiles.length, 1);
  });
});
