// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  hasValidPathSegments,
  stripForbiddenHeaders,
  stripHopByHopHeaders,
} from './proxy-utils';

describe('hasValidPathSegments', () => {
  it('accepts plain segments', () => {
    expect(hasValidPathSegments(['a'])).toBe(true);
    expect(hasValidPathSegments(['cards'])).toBe(true);
    expect(hasValidPathSegments(['0'])).toBe(true);
    expect(hasValidPathSegments(['x.y~z_-'])).toBe(true);
  });

  it('rejects traversal, empty, and malformed segments', () => {
    expect(hasValidPathSegments(['..'])).toBe(false);
    expect(hasValidPathSegments(['.'])).toBe(false);
    expect(hasValidPathSegments(['//'])).toBe(false);
    expect(hasValidPathSegments([''])).toBe(false);
    expect(hasValidPathSegments(['a/b'])).toBe(false);
    expect(hasValidPathSegments(['%2e%2e'])).toBe(false);
    expect(hasValidPathSegments(['a%20b'])).toBe(false);
  });
});

describe('stripForbiddenHeaders', () => {
  it('removes deny-listed headers case-insensitively and keeps safe ones', () => {
    const headers = new Headers({
      Host: 'example.com',
      Cookie: 'a=b',
      'Content-Length': '100',
      Connection: 'keep-alive',
      Authorization: 'Bearer secret',
      'X-API-KEY': 'api-secret',
      'X-Auth-Token': 'token',
      'Proxy-Authorization': 'Basic abc',
      'Content-Type': 'application/json',
      'X-Custom': 'kept',
    });

    const cleaned = stripForbiddenHeaders(headers);

    expect(cleaned.has('Host')).toBe(false);
    expect(cleaned.has('Cookie')).toBe(false);
    expect(cleaned.has('Content-Length')).toBe(false);
    expect(cleaned.has('Connection')).toBe(false);
    expect(cleaned.has('Authorization')).toBe(false);
    expect(cleaned.has('X-API-KEY')).toBe(false);
    expect(cleaned.has('X-Auth-Token')).toBe(false);
    expect(cleaned.has('Proxy-Authorization')).toBe(false);
    expect(cleaned.get('Content-Type')).toBe('application/json');
    expect(cleaned.get('X-Custom')).toBe('kept');

    // The input Headers instance is not mutated.
    expect(headers.get('Host')).toBe('example.com');
    expect(headers.get('Authorization')).toBe('Bearer secret');
  });
});

describe('stripHopByHopHeaders', () => {
  it('removes hop-by-hop headers and connection-listed tokens', () => {
    const headers = new Headers({
      Connection: 'keep-alive, X-Upgrade-Token',
      'Keep-Alive': 'timeout=5',
      'Proxy-Authenticate': 'Basic',
      'Proxy-Authorization': 'Basic abc',
      TE: 'trailers',
      Trailer: 'Expires',
      'Transfer-Encoding': 'chunked',
      Upgrade: 'h2c',
      'X-Upgrade-Token': 'secret',
      'Content-Type': 'application/json',
    });

    const cleaned = stripHopByHopHeaders(headers);

    expect(cleaned.has('Connection')).toBe(false);
    expect(cleaned.has('Keep-Alive')).toBe(false);
    expect(cleaned.has('Proxy-Authenticate')).toBe(false);
    expect(cleaned.has('Proxy-Authorization')).toBe(false);
    expect(cleaned.has('TE')).toBe(false);
    expect(cleaned.has('Trailer')).toBe(false);
    expect(cleaned.has('Transfer-Encoding')).toBe(false);
    expect(cleaned.has('Upgrade')).toBe(false);
    expect(cleaned.has('X-Upgrade-Token')).toBe(false);
    expect(cleaned.get('Content-Type')).toBe('application/json');
  });
});
