// Turns a PascalCase enum value into the lowercase translation-key segment:
// 'UnderReview' → 'underReview'. Unknown or missing values fall back to the
// raw value so next-intl returns the key itself instead of crashing.
export function toEnumKey(value: string | null | undefined): string {
  if (!value) return '';
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const DOCTOR_STATUS_PREFIX = 'statuses.';

// Builds a 'doctor' group key like `statuses.visit.scheduled` for a grouped
// status map (visits, visit types, ...).
export function statusKey(
  group: string,
  value: string | null | undefined,
): string {
  return `${DOCTOR_STATUS_PREFIX}${group}.${toEnumKey(value)}`;
}
