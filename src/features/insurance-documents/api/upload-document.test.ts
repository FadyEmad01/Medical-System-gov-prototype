import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CitizenDocumentResponse } from '../types';
import { uploadDocument } from './upload-document';

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

describe('uploadDocument', () => {
  const token = 'valid-jwt-token';
  const mockResponse: CitizenDocumentResponse = {
    id: '11111111-1111-4111-8111-111111111111',
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

  it('calls http with a FormData body containing required fields and token', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const file = new Blob(['file-content'], { type: 'application/pdf' });

    const result = await uploadDocument(
      { documentType: 'NationalId', file },
      token,
    );

    expect(mockHttp).toHaveBeenCalledWith('/api/insurance/documents/upload', {
      method: 'POST',
      body: expect.any(FormData),
      token,
    });

    const options = mockHttp.mock.calls[0][1] as {
      body: FormData;
      token: string;
    };
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('documentType')).toBe('NationalId');
    expect(options.body.get('file')).toBeInstanceOf(Blob);
    expect(options.body.has('documentNumber')).toBe(false);
    expect(options.body.has('expiresAt')).toBe(false);
    expect(options.body.has('dependentPersonId')).toBe(false);
    expect(options.token).toBe(token);
    expect(result).toEqual(mockResponse);
  });

  it('appends optional fields only when provided', async () => {
    mockHttp.mockResolvedValueOnce(mockResponse);

    const file = new Blob(['file-content'], { type: 'application/pdf' });

    await uploadDocument(
      {
        documentType: 'BirthCertificate',
        file,
        documentNumber: '05376658493657',
        expiresAt: '2027-01-01T00:00:00Z',
        dependentPersonId: '11111111-1111-4111-8111-111111111113',
      },
      token,
    );

    const form = mockHttp.mock.calls[0][1].body as FormData;
    expect(form.get('documentType')).toBe('BirthCertificate');
    expect(form.get('file')).toBeInstanceOf(Blob);
    expect(form.get('documentNumber')).toBe('05376658493657');
    expect(form.get('expiresAt')).toBe('2027-01-01T00:00:00Z');
    expect(form.get('dependentPersonId')).toBe(
      '11111111-1111-4111-8111-111111111113',
    );
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Forbidden'));

    const file = new Blob(['file-content'], { type: 'application/pdf' });

    await expect(
      uploadDocument({ documentType: 'NationalId', file }, token),
    ).rejects.toThrow('Forbidden');
  });
});
