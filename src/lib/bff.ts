export class BffError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly problem?: unknown,
  ) {
    super(message);
    this.name = 'BffError';
  }
}

export interface BffFetchInit {
  method?: string;
  // Same contract as lib/http.ts: plain objects are JSON-stringified,
  // FormData/Blob pass through untouched.
  body?: unknown;
  query?: Record<string, unknown>;
}

type QueryParams = Record<string, unknown>;

function buildUrl(path: string, query?: QueryParams): string {
  if (path.includes('?') || path.includes('#')) {
    throw new Error(
      `Invalid bffFetch path "${path}": must not contain "?" or "#"`,
    );
  }

  const baseUrl = `/api/bff/${path.replace(/^\/+/, '')}`;
  if (query === undefined) return baseUrl;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString === '' ? baseUrl : `${baseUrl}?${queryString}`;
}

function resolveBody(
  body: unknown,
  headers: Headers,
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof Blob) {
    return body;
  }

  if (typeof body === 'string') {
    headers.set('Content-Type', 'application/json');
    return body;
  }

  if (
    body instanceof URLSearchParams ||
    body instanceof ReadableStream ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body;
  }

  headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
}

function firstNonEmptyFieldError(errors: unknown): string | undefined {
  if (errors === null || typeof errors !== 'object') {
    return undefined;
  }

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    const entry = value.find(
      (item) => typeof item === 'string' && item.length > 0,
    );
    if (typeof entry === 'string') return entry;
  }

  return undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function extractErrorMessage(responseBody: unknown, fallback: string): string {
  if (responseBody === null || typeof responseBody !== 'object') {
    return fallback;
  }

  const body = responseBody as Record<string, unknown>;
  const candidates = [
    body.detail,
    firstNonEmptyFieldError(body.errors),
    body.title,
    body.message,
    body.error,
  ];

  for (const candidate of candidates) {
    if (isNonEmptyString(candidate)) return candidate;
  }

  return fallback;
}

async function parseError(response: Response): Promise<BffError> {
  const responseBody = await response.json().catch(() => null);
  const fallback = response.status === 401 ? 'Unauthorized' : 'Request failed';

  return new BffError(
    response.status,
    extractErrorMessage(responseBody, fallback),
    responseBody,
  );
}

export async function bffFetch<T>(
  path: string,
  init: BffFetchInit = {},
): Promise<T> {
  const { method = 'GET', body, query } = init;

  const headers = new Headers();
  const bodyInit = resolveBody(body, headers);

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: 'same-origin',
    headers,
    body: bodyInit,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const responseBody = await response.text();
  if (responseBody === '') {
    return undefined as T;
  }

  try {
    return JSON.parse(responseBody) as T;
  } catch {
    throw new BffError(
      response.status,
      'Invalid response from server',
      responseBody,
    );
  }
}
