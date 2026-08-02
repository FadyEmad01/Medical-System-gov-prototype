import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError, http } from './http';

const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
);

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

describe('http', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('makes a GET request and returns parsed JSON', async () => {
    const data = { id: 1, name: 'test' };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await http<typeof data>('/api/test');
    expect(result).toEqual(data);
  });

  it('sets Content-Type to application/json for requests with body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );

    await http('/api/test', { method: 'POST', body: { name: 'test' } });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.method).toBe('POST');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('sets Authorization header when token is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', { token: 'my-token' });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('omits Authorization header when no token is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test');

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('throws HttpError on 400 response with message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid input' }), {
        status: 400,
      }),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid input');
  });

  it('calls notFound() on 404 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 404 }),
    );

    await expect(http('/api/not-found')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('throws HttpError on 500 response without message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toContain('500');
  });

  it('prepends API_URL to the path', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test');

    const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('http://stg-api.runasp.net/api/test');
  });

  it('propagates network errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    );

    await expect(http('/api/test')).rejects.toThrow('Failed to fetch');
  });

  it('handles non-JSON error responses gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 }),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(500);
  });

  it('sets correct headers for GET request without body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', { method: 'GET' });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.method).toBe('GET');
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('serializes query params and omits nullish values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', {
      query: { a: 1, b: 'x', skip: undefined, nil: null },
    });

    const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('http://stg-api.runasp.net/api/test?a=1&b=x');
  });

  it('passes FormData bodies through unchanged without Content-Type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const formData = new FormData();
    formData.set('file', 'contents');

    await http('/api/upload', {
      method: 'POST',
      body: formData,
      token: 'my-token',
    });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.body).toBe(formData);
    expect(headers.has('Content-Type')).toBe(false);
    expect(headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('passes Blob bodies through unchanged without Content-Type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const blob = new Blob(['data'], { type: 'application/pdf' });

    await http('/api/upload', { method: 'POST', body: blob });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.body).toBe(blob);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('extracts detail from ProblemDetails error responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          title: 'Conflict',
          detail: 'Visit status transition not allowed',
          status: 409,
        }),
        { status: 409 },
      ),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(409);
    expect(error.message).toBe('Visit status transition not allowed');
  });

  it('extracts the first field error from ValidationProblemDetails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          title: 'Validation failed',
          errors: { password: ['Password is required', 'Too short'] },
        }),
        { status: 400 },
      ),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Password is required');
  });

  it('keeps legacy message field in error responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Bad credentials' }), {
        status: 400,
      }),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad credentials');
  });

  it('keeps 0 and false query values', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', { query: { a: 0, b: false } });

    const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('http://stg-api.runasp.net/api/test?a=0&b=false');
  });

  it('omits the query delimiter when all query values are nullish', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', { query: { a: undefined, b: null } });

    const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('http://stg-api.runasp.net/api/test');
  });

  it('respects a caller-set Content-Type header', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', {
      method: 'POST',
      body: { name: 'test' },
      headers: { 'Content-Type': 'application/xml' },
    });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/xml');
  });

  it('extracts the legacy error field from error responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Legacy error' }), {
        status: 400,
      }),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Legacy error');
  });

  it('extracts the title from title-only ProblemDetails responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ title: 'Not Found' }), { status: 400 }),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Not Found');
  });

  it('falls through to the field error when detail is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          title: 'Validation failed',
          detail: '',
          errors: { password: ['Password is required'] },
        }),
        { status: 400 },
      ),
    );

    const error = (await http('/api/test').catch((e) => e)) as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Password is required');
  });

  it('throws when the path already contains a query delimiter', async () => {
    await expect(http('/api/test?x=1')).rejects.toThrow('must not contain');
  });
});
