import { http } from '@/lib/http';
import type { CardDetailResponse } from '../types';

export async function getCardDetail(
  cardId: string,
  token: string,
): Promise<CardDetailResponse> {
  return http<CardDetailResponse>(`/api/insurance/cards/detail/${cardId}`, {
    method: 'GET',
    token,
  });
}
