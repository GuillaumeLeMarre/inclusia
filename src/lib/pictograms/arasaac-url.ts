const ARASAAC_STATIC_BASE = "https://static.arasaac.org/pictograms";

export type ArasaacImageSize = 120 | 300 | 500 | 2500;

export function getArasaacPictogramUrl(pictogramId: number, size: ArasaacImageSize = 500): string {
  return `${ARASAAC_STATIC_BASE}/${pictogramId}/${pictogramId}_${size}.png`;
}

export function getArasaacSearchUrl(keyword: string, locale = "fr"): string {
  const encoded = encodeURIComponent(keyword.trim().toLowerCase());
  return `https://api.arasaac.org/api/pictograms/${locale}/search/${encoded}`;
}
