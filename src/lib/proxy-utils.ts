// Pure header/path helpers shared by the BFF proxy route. Deliberately free of
// 'server-only' and next/server types so these stay unit-testable in vitest.

export const PATH_SEGMENT_PATTERN = /^[A-Za-z0-9._~-]+$/;

// Dot-only segments ("." / "..") would pass the pattern above but act as path
// traversal markers upstream, so they are rejected explicitly.
const DOT_ONLY_SEGMENT = /^\.+$/;

export function hasValidPathSegments(path: string[]): boolean {
  return path.every(
    (segment) =>
      !DOT_ONLY_SEGMENT.test(segment) && PATH_SEGMENT_PATTERN.test(segment),
  );
}

// Forwarded upstream, never echoes client-supplied auth or hop-by-hop values.
export const FORWARD_BLOCKLIST = [
  'host',
  'cookie',
  'content-length',
  'connection',
  'authorization',
  'x-api-key',
  'x-auth-token',
  'proxy-authorization',
];

export function stripForbiddenHeaders(
  headers: Headers,
  denyList = FORWARD_BLOCKLIST,
): Headers {
  const cleaned = new Headers(headers);
  for (const name of denyList) {
    cleaned.delete(name);
  }
  return cleaned;
}

const HOP_BY_HOP_HEADER_NAMES = [
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

export function stripHopByHopHeaders(headers: Headers): Headers {
  const cleaned = new Headers(headers);

  const connection = cleaned.get('connection');
  if (connection !== null) {
    cleaned.delete('connection');
    for (const token of connection.split(',')) {
      const trimmed = token.trim();
      if (trimmed !== '') {
        cleaned.delete(trimmed);
      }
    }
  }

  for (const name of HOP_BY_HOP_HEADER_NAMES) {
    cleaned.delete(name);
  }

  return cleaned;
}
