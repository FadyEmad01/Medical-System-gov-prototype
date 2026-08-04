import 'server-only';
import type { NextRequest } from 'next/server';
import {
  hasValidPathSegments,
  stripForbiddenHeaders,
  stripHopByHopHeaders,
} from '@/lib/proxy-utils';
import { getToken } from '@/lib/server-auth';

const DEFAULT_BFF_TIMEOUT_MS = 10_000;

// BFF_TIMEOUT_MS semantics: 0 fires immediately, NaN degrades, and values
// above 60s are rejected — anything else lets a request hang forever or
// disables the timeout silently, so invalid env input fails loudly at module
// load instead of degrading every request into a 504/502.
function parseBffTimeoutMs(raw: string | undefined): number {
  const parsed = Number(raw ?? DEFAULT_BFF_TIMEOUT_MS);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 60_000) {
    throw new Error(
      `BFF_TIMEOUT_MS must be a finite positive number between 1 and 60000, received "${raw ?? ''}"`,
    );
  }
  return parsed;
}

const API_BASE_URL = process.env.API_URL ?? '';
const BFF_TIMEOUT_MS = parseBffTimeoutMs(process.env.BFF_TIMEOUT_MS);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function unauthorized(): Response {
  return Response.json({ title: 'Unauthorized', status: 401 }, { status: 401 });
}

function badRequest(): Response {
  return Response.json(
    { title: 'Bad Request', detail: 'Invalid path segment', status: 400 },
    { status: 400 },
  );
}

function badGateway(): Response {
  return Response.json(
    {
      title: 'Bad Gateway',
      detail: 'Upstream request failed',
      status: 502,
    },
    { status: 502 },
  );
}

function gatewayTimeout(): Response {
  return Response.json(
    { title: 'Gateway Timeout', status: 504 },
    { status: 504 },
  );
}

function isJsonContentType(contentType: string | null): boolean {
  return contentType?.includes('application/json') ?? false;
}

async function proxyRequest(
  req: NextRequest,
  path: string[],
): Promise<Response> {
  if (!hasValidPathSegments(path)) {
    return badRequest();
  }

  const token = await getToken();
  if (token === null) {
    return unauthorized();
  }

  // Callers may send either the bare backend path ('visits/123') or the full
  // path already carrying the API prefix ('api/visits/123'). Dropping a leading
  // 'api' segment before the unconditional prepend keeps the upstream URL at
  // exactly one '/api/' prefix in both cases.
  const upstreamSegments = path[0] === 'api' ? path.slice(1) : path;
  if (upstreamSegments.length === 0) {
    // Empty remainder after stripping the duplicate 'api' segment
    // (request '/api/bff/api' with path ['api']) is a client error.
    return badRequest();
  }
  const upstreamUrl = `${API_BASE_URL}/api/${upstreamSegments.join('/')}${req.nextUrl.search}`;

  const headers = stripForbiddenHeaders(req.headers);
  headers.set('Authorization', `Bearer ${token}`);

  // X-Forwarded-For is forwarded as-is (preserve-only): the Headers copy above
  // already keeps it, and Next 16 exposes no request-IP accessor to append a
  // client-IP fallback. Neither it nor Content-Type needs an explicit re-set —
  // both survive stripForbiddenHeaders because neither is in FORWARD_BLOCKLIST.

  // Buffer non-JSON bodies before forwarding: a raw ReadableStream body makes
  // undici demand duplex: 'half' (throwing a TypeError that surfaces as a 502),
  // and stream bodies are sent chunked without Content-Length, which
  // IIS-backed hosts reject. Materializing the body lets undici set
  // Content-Length — the same pattern as req.text() for JSON above.
  // Materializing happens inside the try so body-read failures (e.g. a
  // mid-upload client abort) also surface as a 502 via the same catch.
  let body: BodyInit | null | undefined;
  try {
    if (req.body !== null) {
      const contentType = req.headers.get('Content-Type');
      body = isJsonContentType(contentType)
        ? await req.text()
        : await req.arrayBuffer();
    }
    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(BFF_TIMEOUT_MS),
    });

    const responseHeaders = stripHopByHopHeaders(upstreamResponse.headers);
    responseHeaders.delete('set-cookie');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return gatewayTimeout();
    }

    console.error(
      'BFF upstream error:',
      error instanceof Error ? error.message : String(error),
    );
    return badGateway();
  }
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}
