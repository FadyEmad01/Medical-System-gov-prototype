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

interface HttpOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

export async function http<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const { body, token, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 404) {
    notFound();
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    let message: string;
    if (responseBody && typeof responseBody === 'object') {
      message =
        ((responseBody as Record<string, unknown>)?.message as string) ??
        ((responseBody as Record<string, unknown>)?.error as string) ??
        JSON.stringify(responseBody);
    } else {
      message = `Request failed with status ${response.status}`;
    }

    throw new HttpError(response.status, message, responseBody);
  }

  return responseBody as T;
}
