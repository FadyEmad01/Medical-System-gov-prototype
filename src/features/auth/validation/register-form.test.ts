import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import ar from '../translations/ar.json';
import en from '../translations/en.json';

const schemaSource = readFileSync(
  join(process.cwd(), 'src/features/auth/validation/register-form.ts'),
  'utf8',
);

// All zod message strings in the schema are "errors.<key>".
const schemaMessageKeys = Array.from(
  schemaSource.matchAll(/errors\.[a-zA-Z0-9_]+/g),
  (match) => match[0],
);

describe('register form schema translation parity', () => {
  it('every zod message key exists in both locale files', () => {
    expect(schemaMessageKeys.length).toBeGreaterThan(0);

    for (const key of schemaMessageKeys) {
      const messageKey = key.replace('errors.', '');
      expect(en.errors, `en.json is missing "${key}"`).toHaveProperty(
        messageKey,
      );
      expect(ar.errors, `ar.json is missing "${key}"`).toHaveProperty(
        messageKey,
      );
    }
  });
});
