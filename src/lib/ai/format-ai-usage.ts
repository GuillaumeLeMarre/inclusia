export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1).replace(".", ",")} k`;
  }
  return new Intl.NumberFormat("fr-FR").format(tokens);
}

export function formatAiCostEur(costEur: number): string {
  if (costEur >= 1) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(costEur);
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: costEur >= 0.01 ? 2 : 4,
    maximumFractionDigits: costEur >= 0.01 ? 2 : 4,
  }).format(costEur);
}
