// @vitest-environment node
import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks — must be at top level (before any imports) for Vitest hoisting.
// route.ts imports the 'server-only' package, which Next only aliases during
// builds; vitest resolves the ambient type but no runtime module, so it must
// be stubbed here.
const mockGetToken = vi.hoisted(() => vi.fn());

vi.mock('server-only', () => ({}));

vi.mock('@/lib/server-auth', () => ({
  getToken: mockGetToken,
}));

// Now import the actual route handlers.
const { GET, POST } = await import('./route');

function makeRequest(options: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  bodyText?: string;
}): NextRequest {
  const {
    method = 'GET',
    url,
    headers = {},
    body = null,
    bodyText = '',
  } = options;
  return {
    method,
    nextUrl: new URL(url),
    headers: new Headers(headers),
    body,
    text: vi.fn().mockResolvedValue(bodyText),
    arrayBuffer: vi
      .fn()
      .mockResolvedValue(new TextEncoder().encode(bodyText).buffer),
  } as unknown as NextRequest;
}

function stubUpstreamFetch(
  status = 200,
  body = { ok: true },
): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function upstreamUrlOf(fetchMock: ReturnType<typeof vi.fn>): string {
  return String(fetchMock.mock.calls[0][0]);
}

describe('BFF proxy route', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetToken.mockResolvedValue('session-token');
  });

  it('builds a single /api upstream URL for a full path with uuid segment', async () => {
    const fetchMock = stubUpstreamFetch();

    const res = await GET(
      makeRequest({
        url: 'http://localhost/api/bff/api/visits/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      }),
      {
        params: Promise.resolve({
          path: ['api', 'visits', '3fa85f64-5717-4562-b3fc-2c963f66afa6'],
        }),
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(upstreamUrlOf(fetchMock)).toBe(
      `${process.env.API_URL}/api/visits/3fa85f64-5717-4562-b3fc-2c963f66afa6`,
    );
    expect(upstreamUrlOf(fetchMock)).not.toContain('/api/api');
    expect(res.status).toBe(200);
  });

  it('keeps a bare backend path on a single /api upstream URL', async () => {
    const fetchMock = stubUpstreamFetch();

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/visits/123' }),
      { params: Promise.resolve({ path: ['visits', '123'] }) },
    );

    expect(upstreamUrlOf(fetchMock)).toBe(
      `${process.env.API_URL}/api/visits/123`,
    );
    expect(upstreamUrlOf(fetchMock)).not.toContain('/api/api');
    expect(res.status).toBe(200);
  });

  it('strips only a segment exactly equal to api, never an api-prefixed segment', async () => {
    const fetchMock = stubUpstreamFetch();

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/api-foo/bar' }),
      { params: Promise.resolve({ path: ['api-foo', 'bar'] }) },
    );

    expect(upstreamUrlOf(fetchMock)).toBe(
      `${process.env.API_URL}/api/api-foo/bar`,
    );
    expect(upstreamUrlOf(fetchMock)).not.toContain('/api/api/');
    expect(res.status).toBe(200);
  });

  it('preserves the query string on the normalized upstream URL', async () => {
    const fetchMock = stubUpstreamFetch();

    const res = await GET(
      makeRequest({
        url: 'http://localhost/api/bff/api/visits?page=1&pageSize=20',
      }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    expect(upstreamUrlOf(fetchMock)).toBe(
      `${process.env.API_URL}/api/visits?page=1&pageSize=20`,
    );
    expect(upstreamUrlOf(fetchMock)).not.toContain('/api/api');
    expect(res.status).toBe(200);
  });

  it('forwards POST JSON bodies to the normalized upstream URL', async () => {
    const fetchMock = stubUpstreamFetch();
    const payload = JSON.stringify({ note: 'follow-up', status: 'Completed' });

    const res = await POST(
      makeRequest({
        method: 'POST',
        url: 'http://localhost/api/bff/api/visits',
        headers: { 'Content-Type': 'application/json' },
        body: 'placeholder',
        bodyText: payload,
      }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    const [upstreamUrl, init] = fetchMock.mock.calls[0];
    expect(upstreamUrl).toBe(`${process.env.API_URL}/api/visits`);
    expect(upstreamUrl).not.toContain('/api/api');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(payload);
    expect(res.status).toBe(200);
  });

  it('buffers multipart request bodies before forwarding upstream', async () => {
    const fetchMock = stubUpstreamFetch();
    const multipartBody =
      '------test\r\n' +
      'Content-Disposition: form-data; name="file"; filename="a.pdf"\r\n' +
      'Content-Type: application/pdf\r\n' +
      '\r\n' +
      'x\r\n' +
      '------test--';

    const res = await POST(
      makeRequest({
        method: 'POST',
        url: 'http://localhost/api/bff/api/insurance/documents/upload',
        headers: { 'Content-Type': 'multipart/form-data; boundary=----test' },
        body: 'placeholder',
        bodyText: multipartBody,
      }),
      {
        params: Promise.resolve({
          path: ['api', 'insurance', 'documents', 'upload'],
        }),
      },
    );

    const [upstreamUrl, init] = fetchMock.mock.calls[0];
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(upstreamUrl).toBe(
      `${process.env.API_URL}/api/insurance/documents/upload`,
    );
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(ArrayBuffer);
    expect((init.headers as Headers).get('Content-Type')).toBe(
      'multipart/form-data; boundary=----test',
    );
    expect(res.status).toBe(200);
  });

  it('returns 502 when buffering a multipart body fails', async () => {
    const fetchMock = stubUpstreamFetch();
    const req = makeRequest({
      method: 'POST',
      url: 'http://localhost/api/bff/api/insurance/documents/upload',
      headers: { 'Content-Type': 'multipart/form-data; boundary=----test' },
      body: 'placeholder',
    });
    vi.spyOn(req, 'arrayBuffer').mockRejectedValue(
      new Error('client aborted upload'),
    );

    const res = await POST(req, {
      params: Promise.resolve({
        path: ['api', 'insurance', 'documents', 'upload'],
      }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      title: 'Bad Gateway',
      detail: 'Upstream request failed',
      status: 502,
    });
  });

  it('sets Bearer authorization and strips forbidden headers upstream', async () => {
    const fetchMock = stubUpstreamFetch();

    const res = await GET(
      makeRequest({
        url: 'http://localhost/api/bff/api/visits',
        headers: {
          Host: 'localhost',
          Cookie: 'session=leak',
          Authorization: 'Bearer client-token',
          'Content-Type': 'application/json',
          'X-Custom': 'kept',
        },
      }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    const [, init] = fetchMock.mock.calls[0];
    const upstreamHeaders = init.headers as Headers;
    expect(upstreamHeaders.get('Authorization')).toBe('Bearer session-token');
    expect(upstreamHeaders.has('Host')).toBe(false);
    expect(upstreamHeaders.has('Cookie')).toBe(false);
    expect(upstreamHeaders.has('Authorization')).toBe(true);
    expect(upstreamHeaders.get('X-Custom')).toBe('kept');
    expect(res.status).toBe(200);
  });

  it('returns 401 without calling upstream when no session token exists', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    mockGetToken.mockResolvedValue(null);

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/api/visits' }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid path segments before any upstream call', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(makeRequest({ url: 'http://localhost/api/bff/..' }), {
      params: Promise.resolve({ path: ['..'] }),
    });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 when stripping the duplicate api segment leaves an empty path', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/api' }),
      { params: Promise.resolve({ path: ['api'] }) },
    );

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 504 when the upstream request times out', async () => {
    const timeoutError = new Error('The operation was aborted due to timeout');
    timeoutError.name = 'TimeoutError';
    const fetchMock = vi.fn().mockRejectedValue(timeoutError);
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/api/visits' }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    expect(res.status).toBe(504);
  });

  it('returns 502 when the upstream request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/api/visits' }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    expect(res.status).toBe(502);
  });

  it('strips set-cookie from the upstream response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('ok', {
        status: 200,
        headers: { 'Set-Cookie': 'a=b; Path=/' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(
      makeRequest({ url: 'http://localhost/api/bff/api/visits' }),
      { params: Promise.resolve({ path: ['api', 'visits'] }) },
    );

    expect(res.status).toBe(200);
    expect(res.headers.has('set-cookie')).toBe(false);
  });
});
