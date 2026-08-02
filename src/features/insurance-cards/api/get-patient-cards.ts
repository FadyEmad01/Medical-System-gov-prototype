import { http } from '@/lib/http';
import type { CardResponse } from '../types';

export async function getPatientCards(
  patientId: number,
  token: string,
): Promise<CardResponse[]> {
  return http<CardResponse[]>(`/api/insurance/cards/${patientId}`, {
    method: 'GET',
    token,
  });
}
