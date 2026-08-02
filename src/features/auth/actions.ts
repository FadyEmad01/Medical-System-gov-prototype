'use server';

import { revalidateTag } from 'next/cache';
import { deleteToken, getToken, setToken } from '@/lib/server-auth';
import { getCurrentUser } from './api/get-me';
import { loginUser } from './api/login';
import { registerUser } from './api/register';
import type { LoginRequest, RegisterRequest, User } from './types';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function loginAction(
  data: LoginRequest,
): Promise<ActionResult<User>> {
  try {
    const response = await loginUser(data);

    await setToken({
      token: response.token,
      expiresAtUtc: response.expiresAtUtc,
    });

    const user: User = {
      id: response.userId,
      nationalId: response.nationalId,
      username: response.username,
      fullName: response.fullName,
      role: response.role,
    };

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

export async function registerAction(
  data: RegisterRequest,
): Promise<ActionResult<User>> {
  try {
    const response = await registerUser(data);

    await setToken({
      token: response.token,
      expiresAtUtc: response.expiresAtUtc,
    });

    const user: User = {
      id: response.userId,
      nationalId: response.nationalId,
      username: response.username,
      fullName: response.fullName,
      role: response.role,
    };

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function logoutAction(): Promise<void> {
  await deleteToken();
  revalidateTag('session', 'max');
}

export async function getSessionAction(): Promise<User | null> {
  try {
    const token = await getToken();

    if (!token) return null;

    const me = await getCurrentUser(token);

    return {
      id: me.userId,
      nationalId: me.nationalId,
      username: me.username,
      fullName: me.fullName,
      role: me.role,
    };
  } catch {
    await deleteToken().catch(() => {});
    return null;
  }
}
