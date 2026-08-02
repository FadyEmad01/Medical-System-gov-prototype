import type { Gender, MaritalStatus } from '@/lib/api/enums';

export interface ProfileResponse {
  patientId: number;
  nationalId: string | null;
  username: string | null;
  fullName: string | null;
  dateOfBirth: string;
  gender: Gender;
  mobileNumber: string | null;
  governorate: string | null;
  district: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  maritalStatus: MaritalStatus;
  nationality: string | null;
  preferredLanguage: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateProfileRequest {
  occupation?: string | null;
  maritalStatus?: MaritalStatus | null;
  nationality?: string | null;
  preferredLanguage?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}
