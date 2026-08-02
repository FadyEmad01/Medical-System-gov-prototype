import { http } from '@/lib/http';
import type { CardResponse } from '../types';

export async function reactivateCard(
  cardId: string,
  token: string,
): Promise<CardResponse> {
  return http<CardResponse>(`/api/insurance/cards/${cardId}/reactivate`, {
    method: 'PATCH',
    token,
  });
}
