import { http } from '@/lib/http';
import type { CardResponse, ReplaceCardRequest } from '../types';

export async function replaceCard(
  cardId: string,
  data: ReplaceCardRequest,
  token: string,
): Promise<CardResponse> {
  return http<CardResponse>(`/api/insurance/cards/${cardId}/replace`, {
    method: 'POST',
    body: data,
    token,
  });
}
