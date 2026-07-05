import { analyzeFalcText, computeFalcScore } from "@/lib/falc/falc-validator";
import type { KeywordItem } from "@/types";
import type { PedagogicalStrategy } from "@/types/pedagogical-strategy";

export interface AdaptationQualityInput {
  adaptedContent: string;
  summary?: string | null;
  memorySheet?: string | null;
  keywords?: KeywordItem[] | null;
  profileSlugs: string[];
  mergedStrategy: PedagogicalStrategy;
}

export interface AdaptationQualityResult {
  score: number;
  breakdown: {
    readability: number;
    structure: number;
    falcCompliance: number | null;
    pedagogicalOutputs: number;
  };
}

function scoreReadability(text: string): number {
  const sentences = text.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 3);
  if (sentences.length === 0) return 50;
  const avgWords =
    sentences.reduce((sum, s) => sum + s.split(/\s+/).filter(Boolean).length, 0)
    / sentences.length;

  if (avgWords <= 12) return 100;
  if (avgWords <= 16) return 85;
  if (avgWords <= 20) return 65;
  if (avgWords <= 25) return 45;
  return 25;
}

function scoreStructure(text: string): number {
  let score = 40;
  if (/^#{1,3}\s/m.test(text)) score += 25;
  if (/^[-*•]\s/m.test(text)) score += 20;
  if (/^\d+[.)]\s/m.test(text)) score += 15;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  if (paragraphs.length >= 3 && paragraphs.every((p) => p.length < 800)) score += 10;
  return Math.min(100, score);
}

function scorePedagogicalOutputs(input: AdaptationQualityInput): number {
  let score = 0;
  if (input.summary?.trim()) score += 35;
  if (input.memorySheet?.trim()) score += 25;
  if (input.keywords?.length) score += 25;
  if (input.mergedStrategy.objectives.length > 0) score += 15;
  return Math.min(100, score);
}

/** Score qualité global 0–100 pour une adaptation produite. */
export function computeAdaptationQualityScore(
  input: AdaptationQualityInput,
): AdaptationQualityResult {
  const readability = scoreReadability(input.adaptedContent);
  const structure = scoreStructure(input.adaptedContent);
  const pedagogicalOutputs = scorePedagogicalOutputs(input);

  const wantsFalc =
    input.profileSlugs.includes("falc")
    || input.mergedStrategy.linguistic_rules.some((r) => /falc|12 mots/i.test(r));

  let falcCompliance: number | null = null;
  if (wantsFalc) {
    const metrics = analyzeFalcText(input.adaptedContent);
    falcCompliance = computeFalcScore(metrics);
  }

  const weights = wantsFalc
    ? { readability: 0.25, structure: 0.2, falc: 0.35, outputs: 0.2 }
    : { readability: 0.35, structure: 0.3, falc: 0, outputs: 0.35 };

  const score = Math.round(
    readability * weights.readability
    + structure * weights.structure
    + (falcCompliance ?? 0) * weights.falc
    + pedagogicalOutputs * weights.outputs,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      readability,
      structure,
      falcCompliance,
      pedagogicalOutputs,
    },
  };
}
