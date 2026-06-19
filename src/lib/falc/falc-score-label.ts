import type { FalcQualityLabel } from "@/types/falc";

export function getFalcQualityLabel(score: number): FalcQualityLabel {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Bon";
  return "À améliorer";
}

export function getFalcScoreEmoji(score: number): string {
  if (score >= 85) return "🟢";
  if (score >= 70) return "🟡";
  return "🟠";
}
