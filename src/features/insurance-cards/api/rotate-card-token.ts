import { http } from '@/lib/http';
import type { CardResponse } from '../types';

export async function rotateCardToken(
  cardId: string,
  token: string,
): Promise<CardResponse> {
  return http<CardResponse>(`/api/insurance/cards/${cardId}/rotate-token`, {
    method: 'PATCH',
    token,
  });
}
