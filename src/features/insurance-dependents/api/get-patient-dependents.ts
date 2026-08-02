import { http } from '@/lib/http';
import type { DependentResponse } from '../types';

export async function getPatientDependents(
  patientId: number,
  token: string,
): Promise<DependentResponse[]> {
  return http<DependentResponse[]>(`/api/insurance/dependents/${patientId}`, {
    method: 'GET',
    token,
  });
}
