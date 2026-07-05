const MAX_SORT_ORDER = 30;

export const PROFILE_SORT_ORDER_OPTIONS = [
  { value: 0, label: "0 — Fin de liste" },
  ...Array.from({ length: MAX_SORT_ORDER }, (_, index) => {
    const value = index + 1;
    return {
      value,
      label: value === 1 ? "1 — Premier" : String(value),
    };
  }),
];

export function isKnownSortOrder(value: number): boolean {
  return value >= 0 && value <= MAX_SORT_ORDER;
}

export function getSortOrderLabel(value: number): string {
  if (value === 0) return "0 — Fin de liste";
  if (value === 1) return "1 — Premier";
  if (value > MAX_SORT_ORDER) return `${value} (hors liste)`;
  return String(value);
}
