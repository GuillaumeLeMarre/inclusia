import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildRegenerateInputFromAdaptation } from "../../src/services/adaptation/adaptation-regenerate.service.ts";
import type { Adaptation } from "../../src/types/index.ts";
import { DEFAULT_PROFILE_OPTIONS } from "../../src/types/pedagogical-profile.ts";

const baseAdaptation: Adaptation = {
  id: "adapt-1",
  teacher_id: "teacher-1",
  profile_id: "profile-1",
  document_id: "doc-1",
  profile_slugs: ["dyslexie"],
  pedagogical_profile_slugs: [],
  adaptation_quality_score: 80,
  production_options: DEFAULT_PROFILE_OPTIONS,
  status: "completed",
  adaptation_level: "standard",
  falc_score: null,
  falc_content: null,
  generate_pictograms: false,
  falc_pictograms: null,
  adapted_content: "Contenu",
  summary: null,
  memory_sheet: null,
  quiz: null,
  keywords: null,
  simplified_questions: null,
  adapted_instructions: null,
  mindmap: null,
  mindmap_mermaid: null,
  pdf_storage_path: null,
  audio_script: null,
  processing_time_ms: 1000,
  is_demo: false,
  pedagogical_profile_id: null,
  teacher_profile_id: null,
  profile_source: "FALLBACK_PROFILE",
  metadata: {},
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("buildRegenerateInputFromAdaptation", () => {
  it("reconstruit l'entrée depuis un profil enseignant", () => {
    const input = buildRegenerateInputFromAdaptation(
      {
        ...baseAdaptation,
        teacher_profile_id: "tp-1",
        pedagogical_profile_slugs: ["dyslexie"],
        profile_source: "TEACHER_PROFILE",
      },
      "teacher-1",
    );

    assert.equal(input.existingAdaptationId, "adapt-1");
    assert.equal(input.teacherProfileId, "tp-1");
    assert.equal(input.pedagogicalProfileSlug, "dyslexie");
    assert.equal(input.documentId, "doc-1");
  });

  it("ignore le slug falc quand le niveau est falc et privilégie l'id profil", () => {
    const input = buildRegenerateInputFromAdaptation(
      {
        ...baseAdaptation,
        adaptation_level: "falc",
        pedagogical_profile_id: "pp-dyslexie",
        pedagogical_profile_slugs: ["dyslexie", "falc"],
        profile_slugs: ["dyslexie", "falc"],
        profile_source: "SYSTEM_PROFILE",
      },
      "teacher-1",
    );

    assert.equal(input.pedagogicalProfileId, "pp-dyslexie");
    assert.equal(input.pedagogicalProfileSlug, "dyslexie");
    assert.equal(input.pedagogicalProfileSlugs, undefined);
    assert.deepEqual(input.profileSlugs, ["dyslexie"]);
  });

  it("reconstruit l'entrée depuis un profil système", () => {
    const input = buildRegenerateInputFromAdaptation(
      { ...baseAdaptation, pedagogical_profile_id: "pp-1", profile_source: "SYSTEM_PROFILE" },
      "teacher-1",
    );

    assert.equal(input.pedagogicalProfileId, "pp-1");
  });

  it("reconstruit l'entrée depuis plusieurs slugs combinés", () => {
    const input = buildRegenerateInputFromAdaptation(
      {
        ...baseAdaptation,
        pedagogical_profile_slugs: ["dyslexie", "tdah"],
        profile_slugs: ["dyslexie", "tdah"],
      },
      "teacher-1",
    );

    assert.deepEqual(input.pedagogicalProfileSlugs, ["dyslexie", "tdah"]);
  });
});
