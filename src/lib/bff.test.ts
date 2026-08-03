import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BffError, bffFetch } from './bff';

describe('bffFetch', () => {
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

    const result = await bffFetch<typeof data>('/test');
    expect(result).toEqual(data);
  });

  it('requests the BFF path with same-origin credentials', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await bffFetch('/test');

    const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('/api/bff/test');
    expect(options?.credentials).toBe('same-origin');
  });

  it('throws BffError with the detail message on 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ title: 'Unauthorized', detail: 'Session expired' }),
        { status: 401 },
      ),
    );

    const error = (await bffFetch('/test').catch((e) => e)) as BffError;
    expect(error).toBeInstanceOf(BffError);
    expect(error.status).toBe(401);
    expect(error.message).toBe('Session expired');
  });

  it('falls back to Unauthorized when the 401 body has no message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 401 }),
    );

    const error = (await bffFetch('/test').catch((e) => e)) as BffError;
    expect(error).toBeInstanceOf(BffError);
    expect(error.status).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('extracts the first field error from ValidationProblemDetails on 422', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          title: 'Validation failed',
          errors: { password: ['Password is required', 'Too short'] },
        }),
        { status: 422 },
      ),
    );

    const error = (await bffFetch('/test').catch((e) => e)) as BffError;
    expect(error).toBeInstanceOf(BffError);
    expect(error.status).toBe(422);
    expect(error.message).toBe('Password is required');
  });

  it('serializes query params, omits nullish values, keeps 0 and false', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await bffFetch('/test', {
      query: { a: 1, b: 'x', skip: undefined, nil: null, zero: 0, flag: false },
    });

    const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('/api/bff/test?a=1&b=x&zero=0&flag=false');
  });

  it('does not set Content-Type when body is FormData', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const formData = new FormData();
    formData.set('file', 'contents');

    await bffFetch('/upload', { method: 'POST', body: formData });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.body).toBe(formData);
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('sets Content-Type to application/json for string bodies', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await bffFetch('/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('returns undefined for 204 responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    const result = await bffFetch('/test');
    expect(result).toBeUndefined();
  });

  it('propagates network errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    );

    await expect(bffFetch('/test')).rejects.toThrow('Failed to fetch');
  });

  it('throws when the path already contains a query delimiter', async () => {
    await expect(bffFetch('/test?x=1')).rejects.toThrow('must not contain');
  });

  it('prefers detail over field errors when both are present', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          title: 'Validation failed',
          detail: 'Top-level message wins',
          errors: { password: ['Field-level message'] },
        }),
        { status: 422 },
      ),
    );

    const error = (await bffFetch('/test').catch((e) => e)) as BffError;
    expect(error).toBeInstanceOf(BffError);
    expect(error.status).toBe(422);
    expect(error.message).toBe('Top-level message wins');
  });

  it('extracts a plain {error} body into the BffError message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 }),
    );

    const error = (await bffFetch('/test').catch((e) => e)) as BffError;
    expect(error).toBeInstanceOf(BffError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad Request');
  });

  it('throws when the path already contains a fragment delimiter', async () => {
    await expect(bffFetch('/test#frag')).rejects.toThrow('must not contain');
  });

  it('does not set Content-Type when body is a Blob', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const blob = new Blob(['contents'], { type: 'text/plain' });

    await bffFetch('/upload', { method: 'POST', body: blob });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Headers;
    expect(options?.body).toBe(blob);
    expect(headers.has('Content-Type')).toBe(false);
  });
});
