import { notFound } from 'next/navigation';

const API_BASE_URL = process.env.API_URL ?? '';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface HttpOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
  query?: QueryParams;
}

function buildUrl(path: string, query?: QueryParams): string {
  if (path.includes('?') || path.includes('#')) {
    throw new Error(
      `Invalid buildUrl path "${path}": must not contain "?" or "#"`,
    );
  }

  const baseUrl = `${API_BASE_URL}${path}`;
  if (query === undefined) return baseUrl;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString === '' ? baseUrl : `${baseUrl}?${queryString}`;
}

function resolveBodyInit(
  body: unknown,
  headers: Headers,
): BodyInit | undefined {
  if (body instanceof FormData || body instanceof Blob) {
    return body;
  }

  if (body === undefined) {
    return undefined;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

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

function extractErrorMessage(responseBody: unknown, status: number): string {
  if (responseBody === null || typeof responseBody !== 'object') {
    return `Request failed with status ${status}`;
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

  return `Request failed with status ${status}`;
}

export async function http<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const { body, token, query, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers,
    body: resolveBodyInit(body, headers),
  });

  if (response.status === 404) {
    notFound();
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      extractErrorMessage(responseBody, response.status),
      responseBody,
    );
  }

  return responseBody as T;
}
