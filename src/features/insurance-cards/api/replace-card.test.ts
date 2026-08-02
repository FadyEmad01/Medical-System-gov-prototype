import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardResponse, ReplaceCardRequest } from '../types';
import { replaceCard } from './replace-card';

const mockHttp = vi.hoisted(() => vi.fn());

vi.mock('@/lib/http', () => ({
  http: mockHttp,
  HttpError: class HttpError extends Error {
    constructor(
      public status: number,
      message: string,
      public body?: unknown,
    ) {
      super(message);
      this.name = 'HttpError';
    }
  },
}));

describe('replaceCard', () => {
  const token = 'valid-jwt-token';
  const cardId = '11111111-1111-4111-8111-111111111111';
  const mockResponse: CardResponse = {
    cardNumber: 'INS-2026-00000016',
    id: '11111111-1111-4111-8111-111111111114',
    patientId: 1,
    dependentPersonId: null,
    holderFullName: 'Test Patient',
    status: 'Active',
    isCurrentlyValid: true,
    issueReason: 'Replacement',
    version: 1,
    cardTemplate: null,
    tokenVersion: 1,
    replacementReason: 'Lost',
    reasonNote: 'Lost the physical card',
    predecessorCardId: cardId,
    successorCardId: null,
    isLatestCard: true,
    issuedAt: '2026-08-02T10:00:00Z',
    expiresAt: '2027-08-02T10:00:00Z',
    applicationId: '11111111-1111-4111-8111-111111111112',
    createdAt: '2026-08-02T10:00:00Z',
    correlationId: '11111111-1111-4111-8111-111111111113',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, body, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const data: ReplaceCardRequest = {
      replacementReason: 'Lost',
      reasonNote: 'Lost the physical card',
    };

    const result = await replaceCard(cardId, data, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/cards/${cardId}/replace`,
      {
        method: 'POST',
        body: data,
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      replaceCard(cardId, { replacementReason: 'Lost' }, token),
    ).rejects.toThrow('Forbidden');
  });
});
