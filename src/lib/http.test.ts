import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpError } from './http';

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
    const headers = options!.headers as Headers;
    expect(options!.method).toBe('POST');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('sets Authorization header when token is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', { token: 'my-token' });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options!.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('omits Authorization header when no token is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test');

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options!.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('throws HttpError on 400 response with message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid input' }), {
        status: 400,
      }),
    );

    const error = await http('/api/test').catch((e) => e);
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

    const error = await http('/api/test').catch((e) => e);
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

    const error = await http('/api/test').catch((e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(500);
  });

  it('sets correct headers for GET request without body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await http('/api/test', { method: 'GET' });

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options!.headers as Headers;
    expect(options!.method).toBe('GET');
    expect(headers.has('Content-Type')).toBe(false);
  });
});
