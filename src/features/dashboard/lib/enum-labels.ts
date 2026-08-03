// Turns a PascalCase enum value into the lowercase translation-key segment:
// 'UnderReview' → 'underReview'. Unknown values fall back to the raw value so
// next-intl returns the key itself instead of crashing.
export function toEnumKey(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const DASHBOARD_STATUS_PREFIX = 'statuses.';

// Builds a 'dashboard' group key like `statuses.card.active` for a grouped
// status map (visits, cards, applications, ...).
export function statusKey(group: string, value: string): string {
  return `${DASHBOARD_STATUS_PREFIX}${group}.${toEnumKey(value)}`;
}
