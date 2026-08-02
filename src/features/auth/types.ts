import type { Gender, UserRole } from '@/lib/api/enums';

export interface LoginRequest {
  nationalId: string;
  password: string;
}

export interface RegisterRequest {
  nationalId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  dateOfBirth: string;
  gender: Gender;
  mobileNumber: string;
  governorate: string;
  district: string;
  address: string;
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  userId: number;
  nationalId: string | null;
  username: string | null;
  fullName: string | null;
  role: UserRole;
}

export interface MeResponse {
  userId: number;
  nationalId: string | null;
  username: string | null;
  fullName: string | null;
  role: UserRole;
}

export interface User {
  id: number;
  nationalId: string | null;
  username: string | null;
  fullName: string | null;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
