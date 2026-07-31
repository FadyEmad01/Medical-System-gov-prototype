import 'server-only';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';

export interface SessionCookieConfig {
  token: string;
  expiresAtUtc: string;
}

function getMaxAge(expiresAtUtc: string): number {
  const expires = new Date(expiresAtUtc).getTime();
  const now = Date.now();

  return Math.max(0, Math.floor((expires - now) / 1000));
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  return session?.value ?? null;
}

export async function setToken(config: SessionCookieConfig): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, config.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: getMaxAge(config.expiresAtUtc),
  });
}

export async function deleteToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
