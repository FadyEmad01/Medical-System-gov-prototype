import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttachmentResponse } from '../types';
import { getVisitAttachments } from './get-visit-attachments';

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

describe('getVisitAttachments', () => {
  const mockResponse: AttachmentResponse[] = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      visitId: '4c8d1e7a-9f30-4a1c-8f6a-2c963f66afa6',
      fileName: 'report.pdf',
      fileUrl: 'https://res.cloudinary.com/example/report.pdf',
      fileType: 'application/pdf',
      fileSize: 2048,
      uploadedBy: 2,
      uploadedAt: '2026-08-02T08:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const result = await getVisitAttachments(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      'valid-jwt-token',
    );

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/visits/3fa85f64-5717-4562-b3fc-2c963f66afa6/attachments',
      {
        method: 'GET',
        token: 'valid-jwt-token',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      getVisitAttachments(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        'valid-jwt-token',
      ),
    ).rejects.toThrow('Network error');
  });
});
