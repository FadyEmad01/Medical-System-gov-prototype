import { http } from '@/lib/http';
import type { CardResponse } from '../types';

export async function getCurrentCard(
  patientId: number,
  token: string,
): Promise<CardResponse> {
  return http<CardResponse>(`/api/insurance/cards/current/${patientId}`, {
    method: 'GET',
    token,
  });
}
