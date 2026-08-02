import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardDetailResponse } from '../types';
import { getCardDetail } from './get-card-detail';

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

describe('getCardDetail', () => {
  const token = 'valid-jwt-token';
  const cardId = '11111111-1111-4111-8111-111111111111';
  const mockResponse: CardDetailResponse = {
    cardNumber: 'INS-2026-00000015',
    id: cardId,
    patientId: 1,
    dependentPersonId: null,
    holderFullName: 'Test Patient',
    status: 'Active',
    isCurrentlyValid: true,
    issueReason: 'Initial',
    version: 1,
    cardTemplate: null,
    tokenVersion: 1,
    replacementReason: 'Other',
    reasonNote: null,
    predecessorCardId: null,
    successorCardId: null,
    isLatestCard: true,
    issuedAt: '2026-08-02T10:00:00Z',
    expiresAt: '2027-08-02T10:00:00Z',
    applicationId: '11111111-1111-4111-8111-111111111112',
    createdAt: '2026-08-02T10:00:00Z',
    correlationId: '11111111-1111-4111-8111-111111111113',
    statusHistory: [
      {
        id: '11111111-1111-4111-8111-111111111114',
        previousStatus: 'Active',
        newStatus: 'Suspended',
        reason: 'Suspected fraud',
        changedBy: 2,
        changedAt: '2026-08-02T10:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getCardDetail(cardId, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/cards/detail/${cardId}`,
      {
        method: 'GET',
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(getCardDetail(cardId, token)).rejects.toThrow('Forbidden');
  });
});
