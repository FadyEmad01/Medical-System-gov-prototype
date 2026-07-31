import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LoginRequest, RegisterRequest, User } from './types';

// Mocks — must be at top level (before any imports) for Vitest hoisting
const mockSetToken = vi.hoisted(() => vi.fn());
const mockGetToken = vi.hoisted(() => vi.fn());
const mockDeleteToken = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockLoginUser = vi.hoisted(() => vi.fn());
const mockRegisterUser = vi.hoisted(() => vi.fn());
const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockRevalidateTag = vi.hoisted(() => vi.fn());

vi.mock('@/lib/server-auth', () => ({
  setToken: mockSetToken,
  getToken: mockGetToken,
  deleteToken: mockDeleteToken,
}));

vi.mock('./api/login', () => ({
  loginUser: mockLoginUser,
}));

vi.mock('./api/register', () => ({
  registerUser: mockRegisterUser,
}));

vi.mock('./api/get-me', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}));

// Now import the actual actions module
const { loginAction, registerAction, logoutAction, getSessionAction } =
  await import('./actions');

describe('loginAction', () => {
  const validCredentials: LoginRequest = {
    nationalId: '05376658493657',
    password: 'correct-password',
  };

  const authResponse = {
    token: 'jwt-token',
    expiresAtUtc: '2026-08-06T00:00:00Z',
    userId: 1,
    nationalId: '05376658493657',
    username: 'testuser',
    fullName: 'Test User',
    role: 'Patient',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets cookie and returns user on successful login', async () => {
    mockLoginUser.mockResolvedValueOnce(authResponse);

    const result = await loginAction(validCredentials);

    expect(mockLoginUser).toHaveBeenCalledWith(validCredentials);
    expect(mockSetToken).toHaveBeenCalledWith({
      token: 'jwt-token',
      expiresAtUtc: '2026-08-06T00:00:00Z',
    });
    expect(result).toEqual({
      success: true,
      data: {
        id: 1,
        nationalId: '05376658493657',
        username: 'testuser',
        fullName: 'Test User',
        role: 'Patient',
      },
    });
  });

  it('returns error result on failed login', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    const result = await loginAction(validCredentials);

    expect(mockSetToken).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: 'Invalid credentials',
    });
  });

  it('does not expose internal error details', async () => {
    mockLoginUser.mockRejectedValueOnce('Unknown error');

    const result = await loginAction(validCredentials);

    expect(result).toEqual({
      success: false,
      error: 'Login failed',
    });
  });
});

describe('registerAction', () => {
  const validData: RegisterRequest = {
    nationalId: '05376658493657',
    firstName: 'New',
    secondName: 'User',
    thirdName: 'Test',
    fourthName: 'Account',
    dateOfBirth: '1990-01-15',
    gender: 'Male',
    mobileNumber: '01203289612',
    governorate: 'Cairo',
    district: 'Maadi',
    address: '123 Main St',
    username: 'newuser',
    password: 'securePass123',
  };

  const authResponse = {
    token: 'new-jwt-token',
    expiresAtUtc: '2026-08-06T00:00:00Z',
    userId: 2,
    nationalId: '05376658493657',
    username: 'newuser',
    fullName: 'New User',
    role: 'Patient',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets cookie and returns user on successful registration', async () => {
    mockRegisterUser.mockResolvedValueOnce(authResponse);

    const result = await registerAction(validData);

    expect(mockRegisterUser).toHaveBeenCalledWith(validData);
    expect(mockSetToken).toHaveBeenCalledWith({
      token: 'new-jwt-token',
      expiresAtUtc: '2026-08-06T00:00:00Z',
    });
    expect(result).toEqual({
      success: true,
      data: {
        id: 2,
        nationalId: '05376658493657',
        username: 'newuser',
        fullName: 'New User',
        role: 'Patient',
      },
    });
  });

  it('returns error result on failed registration', async () => {
    mockRegisterUser.mockRejectedValueOnce(
      new Error('National ID already exists'),
    );

    const result = await registerAction(validData);

    expect(mockSetToken).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: 'National ID already exists',
    });
  });
});

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes token cookie and revalidates session tag', async () => {
    await logoutAction();

    expect(mockDeleteToken).toHaveBeenCalledOnce();
    expect(mockRevalidateTag).toHaveBeenCalledWith('session', 'max');
  });
});

describe('getSessionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user when valid token exists', async () => {
    mockGetToken.mockResolvedValueOnce('valid-token');
    mockGetCurrentUser.mockResolvedValueOnce({
      userId: 1,
      nationalId: '05376658493657',
      username: 'testuser',
      fullName: 'Test User',
      role: 'Patient',
    });

    const result = await getSessionAction();

    expect(result).toEqual({
      id: 1,
      nationalId: '05376658493657',
      username: 'testuser',
      fullName: 'Test User',
      role: 'Patient',
    });
  });

  it('returns null when no token cookie exists', async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const result = await getSessionAction();

    expect(result).toBeNull();
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it('returns null and cleans up when token is expired/invalid', async () => {
    mockGetToken.mockResolvedValueOnce('expired-token');
    mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthorized'));

    const result = await getSessionAction();

    expect(result).toBeNull();
    expect(mockDeleteToken).toHaveBeenCalledOnce();
  });
});
