import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UploadAttachmentResponse } from '../types';
import { uploadAttachment } from './upload-attachment';

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

describe('uploadAttachment', () => {
  const mockResponse: UploadAttachmentResponse = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    fileName: 'report.pdf',
    fileUrl: 'https://res.cloudinary.com/example/report.pdf',
    fileType: 'application/pdf',
    fileSize: 2048,
    uploadedAt: '2026-08-02T08:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with FormData body and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const file = new File(['content'], 'report.pdf', {
      type: 'application/pdf',
    });
    const result = await uploadAttachment(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      file,
      'valid-jwt-token',
    );

    expect(mockHttp).toHaveBeenCalledWith(
      '/api/visits/3fa85f64-5717-4562-b3fc-2c963f66afa6/attachments',
      {
        method: 'POST',
        body: expect.any(FormData),
        token: 'valid-jwt-token',
      },
    );
    const options = mockHttp.mock.calls[0][1] as {
      body: FormData;
      token: string;
    };
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('file')).toBeInstanceOf(File);
    expect(options.token).toBe('valid-jwt-token');
    expect(result).toEqual(mockResponse);
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    const file = new File(['content'], 'report.pdf', {
      type: 'application/pdf',
    });

    await expect(
      uploadAttachment(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        file,
        'valid-jwt-token',
      ),
    ).rejects.toThrow('Network error');
  });
});
