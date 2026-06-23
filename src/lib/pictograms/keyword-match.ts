/** Correspondance stricte mot entier (pas de sous-chaîne type biens ⊂ amphibiens). */
export function pictogramKeywordsEquivalent(keyword: string, term: string): boolean {
  const a = keyword.toLowerCase().trim();
  const b = term.toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;
  return isFrenchPluralVariant(a, b);
}

function isFrenchPluralVariant(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) !== 1) return false;
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return longer === `${shorter}s` || longer === `${shorter}x`;
}

export const MIN_ARASAAC_KEYWORD_SCORE = 85;
