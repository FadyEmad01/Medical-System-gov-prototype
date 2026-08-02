import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthResponse, RegisterRequest } from '../types';
import { registerUser } from './register';

const mockHttp = vi.hoisted(() => vi.fn());

vi.mock('@/lib/http', () => ({
  http: mockHttp,
  HttpError: class HttpError extends Error {
    constructor(
      public status: number,
      message: string,
      public body?: unknown,
    ) {
      super(message);
      this.name = 'HttpError';
    }
  },
}));

describe('registerUser', () => {
  const mockResponse: AuthResponse = {
    token: 'jwt-token',
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

  it('calls http with correct path, method, and body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: RegisterRequest = {
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
      email: 'newuser@example.com',
    };

    const result = await registerUser(data);

    expect(mockHttp).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: data,
    });
    expect(result).toEqual(mockResponse);
  });

  it('works without optional email field', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: RegisterRequest = {
      nationalId: '05376658493657',
      firstName: 'New',
      secondName: 'User',
      thirdName: 'Test',
      fourthName: 'Account',
      dateOfBirth: '1990-01-15',
      gender: 'Female',
      mobileNumber: '01203289612',
      governorate: 'Giza',
      district: 'Dokki',
      address: '456 Oak St',
      username: 'newuser2',
      password: 'securePass456',
    };

    const result = await registerUser(data);

    expect(mockHttp).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: data,
    });
    expect(result).toEqual(mockResponse);
  });
});
