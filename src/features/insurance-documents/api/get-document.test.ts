import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CitizenDocumentResponse } from '../types';
import { getDocument } from './get-document';

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

describe('getDocument', () => {
  const token = 'valid-jwt-token';
  const documentId = '11111111-1111-4111-8111-111111111111';
  const mockResponse: CitizenDocumentResponse = {
    id: documentId,
    patientId: 1,
    dependentPersonId: null,
    documentType: 'NationalId',
    documentNumber: '05376658493657',
    fileName: 'national-id.pdf',
    fileUrl: 'https://res.cloudinary.com/example/upload/v1/national-id.pdf',
    fileType: 'application/pdf',
    fileSize: 204800,
    uploadedAt: '2026-08-02T10:00:00Z',
    expiresAt: null,
    reviewStatus: 'Pending',
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    isCurrent: true,
    correlationId: '11111111-1111-4111-8111-111111111112',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token without a body', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getDocument(documentId, token);

    expect(mockHttp).toHaveBeenCalledWith(
      `/api/insurance/documents/document/${documentId}`,
      {
        method: 'GET',
        token,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    await expect(getDocument(documentId, token)).rejects.toThrow('Forbidden');
  });
});
