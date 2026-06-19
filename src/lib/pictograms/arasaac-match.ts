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

  for (const kw of result.keywords ?? []) {
    const keyword = kw.keyword?.toLowerCase() ?? "";
    if (keyword === term) score += 100;
    else if (keyword.includes(term) || term.includes(keyword)) score += 40;
    if (kw.type === 1) score += 25;
    else if (kw.type === 2) score += 10;
  }

  if (result.schematic) score += 15;
  if (result.aac) score += 10;

  return score;
}

export function pickBestArasaacResult(
  results: ArasaacSearchResult[],
  searchTerm: string,
): ArasaacSearchResult | null {
  if (!results.length) return null;

  const ranked = [...results].sort(
    (a, b) => scoreArasaacMatch(b, searchTerm) - scoreArasaacMatch(a, searchTerm),
  );

  return ranked[0] ?? null;
}
