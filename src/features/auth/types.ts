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
  gender: 'Male' | 'Female';
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
  nationalId: string;
  username: string;
  fullName: string;
  role: string;
}

export interface User {
  id: number;
  nationalId: string;
  username: string;
  fullName: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
