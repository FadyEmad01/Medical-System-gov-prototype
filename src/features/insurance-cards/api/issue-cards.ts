import { http } from '@/lib/http';
import type { CardResponse } from '../types';

export async function issueCards(
  applicationId: string,
  token: string,
): Promise<CardResponse[]> {
  return http<CardResponse[]>(`/api/insurance/cards/issue/${applicationId}`, {
    method: 'POST',
    token,
  });
}
