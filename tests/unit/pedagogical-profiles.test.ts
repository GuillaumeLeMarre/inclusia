import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getFallbackProfileBySlug,
  getFallbackProfiles,
  fallbackToResolved,
  seedDimensionsFromSeed,
  resetFallbackCache,
} from "../../src/services/profiles/fallback-profile.service.ts";
import { mergePedagogicalStrategies, mergeWithTeacherCustomization } from "../../src/services/profiles/strategy-merge.service.ts";
import { strategyToPromptBlock } from "../../src/services/profiles/strategy-prompt.service.ts";
import { buildProfileAdaptationPrompt } from "../../src/services/profiles/profile-prompt-builder.service.ts";
import { computeAdaptationQualityScore } from "../../src/services/profiles/adaptation-quality-score.service.ts";
import { emptyStrategy } from "../../src/types/pedagogical-profile.ts";
import {
  profileRulesSchema,
  MAX_PROFILE_RULES,
  MAX_PROFILE_RULE_LENGTH,
} from "../../src/schemas/profile-rules.schema.ts";
import { strategyFromTeacherDimensions } from "../../src/lib/profiles/strategy-columns.ts";
import { EMPTY_TEACHER_DIMENSIONS } from "../../src/types/pedagogical-dimensions.ts";

describe("profile-rules.schema", () => {
  it("trim et supprime les entrées vides", () => {
    const result = profileRulesSchema.parse(["  Règle A  ", "", "  "]);
    assert.deepEqual(result, ["Règle A"]);
  });

  it("refuse plus de 50 règles", () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => `Règle ${i}`);
    assert.throws(() => profileRulesSchema.parse(tooMany));
  });

  it("refuse une règle de plus de 300 caractères", () => {
    const long = "x".repeat(MAX_PROFILE_RULE_LENGTH + 1);
    assert.throws(() => profileRulesSchema.parse([long]));
  });

  it("accepte jusqu'à 50 règles valides", () => {
    const rules = Array.from({ length: MAX_PROFILE_RULES }, (_, i) => `Règle ${i}`);
    assert.equal(profileRulesSchema.parse(rules).length, MAX_PROFILE_RULES);
  });
});

describe("fallback-profile.service", () => {
  it("charge 12 profils système par défaut", () => {
    resetFallbackCache();
    const profiles = getFallbackProfiles();
    assert.equal(profiles.length, 12);
    assert.ok(profiles.some((p) => p.slug === "dyslexie"));
  });

  it("expose les 8 sections plates dans le seed", () => {
    resetFallbackCache();
    const seed = getFallbackProfileBySlug("dyslexie")!;
    const dimensions = seedDimensionsFromSeed(seed);
    assert.ok(dimensions.pedagogical_objectives.length >= 3);
    assert.ok(dimensions.linguistic_rules.length >= 3);
    assert.ok(dimensions.exercise_adaptations.some((r) => /QCM/i.test(r)));
  });

  it("résout un profil fallback avec stratégie structurée", () => {
    const seed = getFallbackProfileBySlug("tdah")!;
    const resolved = fallbackToResolved(seed);
    assert.equal(resolved.source, "FALLBACK_PROFILE");
    assert.ok(resolved.mergedStrategy.objectives.length > 0);
  });
});

describe("strategy-merge.service", () => {
  it("fusionne dyslexie + TDAH", () => {
    const dys = getFallbackProfileBySlug("dyslexie")!;
    const tdah = getFallbackProfileBySlug("tdah")!;
    const dysDims = seedDimensionsFromSeed(dys);
    const tdahDims = seedDimensionsFromSeed(tdah);
    const merged = mergePedagogicalStrategies([
      { slug: "dyslexie", name: dys.name, strategy: { ...emptyStrategy(), objectives: dysDims.pedagogical_objectives, linguistic_rules: dysDims.linguistic_rules, layout_rules: dysDims.layout_rules, structure_rules: dysDims.structuring_rules, visual_aids: dysDims.visual_aids, audio_aids: dysDims.audio_aids, exercise_adaptations: dysDims.exercise_adaptations, evaluation_rules: dysDims.evaluation_rules } },
      { slug: "tdah", name: tdah.name, strategy: { ...emptyStrategy(), objectives: tdahDims.pedagogical_objectives, linguistic_rules: tdahDims.linguistic_rules, layout_rules: tdahDims.layout_rules, structure_rules: tdahDims.structuring_rules, visual_aids: tdahDims.visual_aids, audio_aids: tdahDims.audio_aids, exercise_adaptations: tdahDims.exercise_adaptations, evaluation_rules: tdahDims.evaluation_rules } },
    ]);
    assert.ok(merged.objectives.length >= dysDims.pedagogical_objectives.length);
  });

  it("fusionne profil système + personnalisation enseignant", () => {
    const dys = getFallbackProfileBySlug("dyslexie")!;
    const dims = seedDimensionsFromSeed(dys);
    const systemStrategy = {
      ...emptyStrategy(),
      objectives: dims.pedagogical_objectives,
      linguistic_rules: dims.linguistic_rules,
      layout_rules: dims.layout_rules,
      structure_rules: dims.structuring_rules,
      visual_aids: dims.visual_aids,
      audio_aids: dims.audio_aids,
      exercise_adaptations: dims.exercise_adaptations,
      evaluation_rules: dims.evaluation_rules,
    };
    const teacherExtra = strategyFromTeacherDimensions({
      ...EMPTY_TEACHER_DIMENSIONS,
      custom_linguistic_rules: ["Utiliser des phrases de 8 mots maximum"],
    });
    const merged = mergeWithTeacherCustomization(systemStrategy, null, teacherExtra);
    assert.ok(merged.linguistic_rules.some((r) => /8 mots/i.test(r)));
    assert.ok(merged.linguistic_rules.some((r) => /courtes/i.test(r)));
  });
});

describe("profile-prompt-builder", () => {
  it("inclut les 8 sections pédagogiques dans le prompt système", () => {
    const seed = getFallbackProfileBySlug("falc")!;
    const resolved = fallbackToResolved(seed);
    const built = buildProfileAdaptationPrompt({
      resolved,
      sourceText: "Texte source de test pour l'adaptation pédagogique.",
      documentTitle: "Cours test",
    });

    assert.match(built.system, /Objectifs pédagogiques/);
    assert.match(built.system, /Règles linguistiques/);
    assert.match(built.system, /Règles de mise en page/);
    assert.match(built.system, /Règles de structuration/);
    assert.match(built.system, /Aides visuelles/);
    assert.match(built.system, /Aides audio/);
    assert.match(built.system, /Adaptations des exercices/);
    assert.match(built.system, /Règles d'évaluation/);
    assert.match(built.system, /Inclusia/);
    assert.match(built.system, /stratégie pédagogique structurée/i);
    assert.match(built.user, /Contenu source/);
  });

  it("strategyToPromptBlock respecte l'ordre des sections", () => {
    const seed = getFallbackProfileBySlug("dyslexie")!;
    const block = strategyToPromptBlock(fallbackToResolved(seed).mergedStrategy);
    const objIdx = block.indexOf("Objectifs pédagogiques");
    const langIdx = block.indexOf("Règles linguistiques");
    const layoutIdx = block.indexOf("Règles de mise en page");
    const evalIdx = block.indexOf("Règles d'évaluation");
    assert.ok(objIdx < langIdx && langIdx < layoutIdx && layoutIdx < evalIdx);
  });
});

describe("adaptation-quality-score.service", () => {
  it("retourne un score entre 0 et 100", () => {
    const dys = getFallbackProfileBySlug("dyslexie")!;
    const result = computeAdaptationQualityScore({
      adaptedContent: "## Intro\n\nPhrase courte.\n\n- Point",
      summary: "Résumé.",
      memorySheet: "Fiche.",
      keywords: [{ term: "mot", definition: "déf" }],
      profileSlugs: ["dyslexie"],
      mergedStrategy: fallbackToResolved(dys).mergedStrategy,
    });
    assert.ok(result.score >= 0 && result.score <= 100);
  });
});

describe("import/export dimensions", () => {
  it("export inclut les sections personnalisées enseignant", async () => {
    const { exportTeacherProfiles } = await import("../../src/services/profiles/teacher-profile.service.ts");
    const exported = exportTeacherProfiles([
      {
        id: "1",
        teacher_id: "t1",
        source_profile_id: null,
        name: "Test",
        description: null,
        custom_prompt: null,
        custom_rules: null,
        ...EMPTY_TEACHER_DIMENSIONS,
        custom_linguistic_rules: ["Phrase courte"],
        custom_strategy: strategyFromTeacherDimensions({
          ...EMPTY_TEACHER_DIMENSIONS,
          custom_linguistic_rules: ["Phrase courte"],
        }),
        adaptation_level: "standard",
        options: { generate_summary: true, generate_quiz: true, generate_mindmap: true, generate_audio: false, generate_falc: false },
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    ]);
    assert.equal(exported.profiles[0]?.custom_linguistic_rules?.[0], "Phrase courte");
  });
});
