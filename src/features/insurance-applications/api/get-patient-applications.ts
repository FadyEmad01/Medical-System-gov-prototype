import { http } from '@/lib/http';
import type { ApplicationResponse } from '../types';

export async function getPatientApplications(
  patientId: number,
  token: string,
): Promise<ApplicationResponse[]> {
  return http<ApplicationResponse[]>(
    `/api/insurance/applications/${patientId}`,
    {
      method: 'GET',
      token,
    },
  );
}
