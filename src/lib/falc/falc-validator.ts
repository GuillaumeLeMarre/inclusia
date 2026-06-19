import { getFalcQualityLabel } from "@/lib/falc/falc-score-label";
import type { FalcMetrics, FalcValidationResult } from "@/types/falc";

const COMPLEX_WORD_MIN_LENGTH = 9;
const PASSIVE_PATTERNS = [
  /\b(est|sont|été|sera|seront|fut|furent)\s+\w+(é|ée|és|ées)\b/i,
  /\b(a|ont|avait|avaient)\s+été\b/i,
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

function countWords(sentence: string): number {
  return sentence.split(/\s+/).filter(Boolean).length;
}

function isComplexWord(word: string): boolean {
  const clean = word.replace(/[^a-zàâäéèêëïîôùûüç'-]/gi, "");
  return clean.length >= COMPLEX_WORD_MIN_LENGTH;
}

function isPassive(sentence: string): boolean {
  return PASSIVE_PATTERNS.some((p) => p.test(sentence));
}

export function analyzeFalcText(text: string): FalcMetrics {
  const sentences = splitSentences(text);
  const words = text.split(/\s+/).filter(Boolean);
  const sentenceCount = Math.max(sentences.length, 1);
  const wordCount = words.length;
  const totalWordsInSentences = sentences.reduce((sum, s) => sum + countWords(s), 0);
  const averageWordsPerSentence = totalWordsInSentences / sentenceCount;
  const complexWordCount = words.filter(isComplexWord).length;
  const passiveSentenceCount = sentences.filter(isPassive).length;
  const densityScore = wordCount / Math.max(sentenceCount, 1);

  return {
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    complexWordCount,
    passiveSentenceCount,
    sentenceCount,
    wordCount,
    densityScore: Math.round(densityScore * 10) / 10,
  };
}

export function computeFalcScore(metrics: FalcMetrics): number {
  let score = 100;

  if (metrics.averageWordsPerSentence > 12) {
    score -= Math.min(30, (metrics.averageWordsPerSentence - 12) * 4);
  } else if (metrics.averageWordsPerSentence > 10) {
    score -= (metrics.averageWordsPerSentence - 10) * 3;
  }

  const complexRatio = metrics.complexWordCount / Math.max(metrics.wordCount, 1);
  score -= Math.min(25, complexRatio * 120);

  const passiveRatio = metrics.passiveSentenceCount / Math.max(metrics.sentenceCount, 1);
  score -= Math.min(20, passiveRatio * 40);

  if (metrics.densityScore > 14) score -= Math.min(15, (metrics.densityScore - 14) * 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function validateFalcContent(text: string): FalcValidationResult {
  const metrics = analyzeFalcText(text);
  const score = computeFalcScore(metrics);
  return {
    score,
    label: getFalcQualityLabel(score),
    metrics,
  };
}
