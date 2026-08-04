import { describe, expect, it } from 'vitest';
import { statusKey, toEnumKey } from './enum-labels';

describe('toEnumKey', () => {
  it('lowercases the first letter of a PascalCase value', () => {
    expect(toEnumKey('UnderReview')).toBe('underReview');
  });
  it('returns an empty string for empty input', () => {
    expect(toEnumKey('')).toBe('');
  });
  it('does not crash on null or undefined', () => {
    expect(toEnumKey(null)).toBe('');
    expect(toEnumKey(undefined)).toBe('');
  });
});

describe('statusKey', () => {
  it('builds a namespaced key', () => {
    expect(statusKey('application', 'UnderReview')).toBe(
      'statuses.application.underReview',
    );
  });
  it('falls back to a group-only key for null values', () => {
    expect(statusKey('application', null)).toBe('statuses.application.');
  });
});
