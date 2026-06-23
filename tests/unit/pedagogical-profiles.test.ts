import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getFallbackProfileBySlug,
  getFallbackProfiles,
  fallbackToResolved,
  resetFallbackCache,
} from "../../src/services/profiles/fallback-profile.service.ts";

describe("fallback-profile.service", () => {
  it("charge 12 profils système par défaut", () => {
    resetFallbackCache();
    const profiles = getFallbackProfiles();
    assert.equal(profiles.length, 12);
    assert.ok(profiles.some((p) => p.slug === "dyslexie"));
    assert.ok(profiles.some((p) => p.slug === "lecture_simplifiee"));
  });

  it("résout un profil fallback par slug", () => {
    const seed = getFallbackProfileBySlug("tdah");
    assert.ok(seed);
    const resolved = fallbackToResolved(seed!);
    assert.equal(resolved.source, "FALLBACK_PROFILE");
    assert.equal(resolved.slug, "tdah");
    assert.ok(resolved.pedagogicalRules.length > 0);
  });
});

describe("profile-prompt-builder (smoke)", () => {
  it("n'utilise pas le terme pathologie dans les règles fallback", () => {
    const seed = getFallbackProfileBySlug("falc")!;
    const resolved = fallbackToResolved(seed);
    assert.doesNotMatch(resolved.pedagogicalRules, /pathologie|diagnostic|maladie/i);
  });
});
