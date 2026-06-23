import {
  MIN_ARASAAC_KEYWORD_SCORE,
  pictogramKeywordsEquivalent,
} from "@/lib/pictograms/keyword-match";

export interface ArasaacKeyword {
  keyword: string;
  type?: number;
  hasLocution?: boolean;
  plural?: string;
}

export interface ArasaacSearchResult {
  _id: number;
  schematic?: boolean;
  aac?: boolean;
  keywords?: ArasaacKeyword[];
}

export function scoreArasaacMatch(result: ArasaacSearchResult, searchTerm: string): number {
  const term = searchTerm.toLowerCase().trim();
  let score = 0;
  let hasKeywordMatch = false;

  for (const kw of result.keywords ?? []) {
    const keyword = kw.keyword?.toLowerCase() ?? "";
    if (keyword === term) {
      score += 100;
      hasKeywordMatch = true;
    } else if (pictogramKeywordsEquivalent(keyword, term)) {
      score += 85;
      hasKeywordMatch = true;
    }

    if (hasKeywordMatch) {
      if (kw.type === 1) score += 25;
      else if (kw.type === 2) score += 10;
    }
  }

  if (hasKeywordMatch) {
    if (result.schematic) score += 15;
    if (result.aac) score += 10;
  }

  return score;
}

export function pickBestArasaacResult(
  results: ArasaacSearchResult[],
  searchTerm: string,
): ArasaacSearchResult | null {
  if (!results.length) return null;

  const ranked = [...results]
    .map((result) => ({ result, score: scoreArasaacMatch(result, searchTerm) }))
    .filter(({ score }) => score >= MIN_ARASAAC_KEYWORD_SCORE)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.result ?? null;
}
