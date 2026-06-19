import {
  getArasaacPictogramUrl,
  getArasaacSearchUrl,
} from "@/lib/pictograms/arasaac-url";
import {
  pickBestArasaacResult,
  type ArasaacSearchResult,
} from "@/lib/pictograms/arasaac-match";
import type { FalcPictogramItem } from "@/types/falc";

const SEARCH_TIMEOUT_MS = 8000;

async function fetchArasaacResults(
  keyword: string,
  locale = "fr",
): Promise<ArasaacSearchResult[]> {
  const url = getArasaacSearchUrl(keyword, locale);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ArasaacSearchResult[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function toPictogramItem(keyword: string, result: ArasaacSearchResult): FalcPictogramItem {
  const label =
    result.keywords?.find((k) => k.keyword.toLowerCase() === keyword.toLowerCase())?.keyword
    ?? result.keywords?.[0]?.keyword
    ?? keyword;

  return {
    id: result._id,
    keyword,
    label,
    imageUrl: getArasaacPictogramUrl(result._id, 500),
    source: "arasaac",
  };
}

export async function searchArasaacPictogram(
  keyword: string,
  locale = "fr",
): Promise<FalcPictogramItem | null> {
  const results = await fetchArasaacResults(keyword, locale);
  const best = pickBestArasaacResult(results, keyword);
  if (!best) return null;
  return toPictogramItem(keyword, best);
}

export async function searchArasaacPictograms(
  keywords: string[],
  locale = "fr",
): Promise<FalcPictogramItem[]> {
  const unique = [...new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))];
  const items: FalcPictogramItem[] = [];
  const usedIds = new Set<number>();

  await Promise.all(
    unique.map(async (keyword) => {
      const item = await searchArasaacPictogram(keyword, locale);
      if (!item || usedIds.has(item.id)) return;
      usedIds.add(item.id);
      items.push(item);
    }),
  );

  return items.sort((a, b) => unique.indexOf(a.keyword) - unique.indexOf(b.keyword));
}
