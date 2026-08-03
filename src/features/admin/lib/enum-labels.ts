// Turns a PascalCase enum value into the lowercase translation-key segment:
// 'UnderReview' → 'underReview'. Unknown values fall back to the raw value so
// next-intl returns the key itself instead of crashing.
export function toEnumKey(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const ADMIN_STATUS_PREFIX = 'statuses.';

// Builds an 'admin' group key like `statuses.riskLevel.critical` for a
// grouped status map (categories, risk levels, failure reasons, ...).
export function statusKey(group: string, value: string): string {
  return `${ADMIN_STATUS_PREFIX}${group}.${toEnumKey(value)}`;
}
