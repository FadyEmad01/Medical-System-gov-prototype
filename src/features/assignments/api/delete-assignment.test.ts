import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteAssignment } from './delete-assignment';

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

describe('deleteAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls http with correct path, method, and token', async () => {
    mockHttp.mockResolvedValueOnce(null);

    await deleteAssignment(1, 2, 'valid-jwt-token');

    expect(mockHttp).toHaveBeenCalledWith('/api/doctors/1/patients/2', {
      method: 'DELETE',
      token: 'valid-jwt-token',
    });
  });

  it('propagates http errors', async () => {
    mockHttp.mockRejectedValueOnce(new Error('Network error'));

    await expect(deleteAssignment(1, 2, 'valid-jwt-token')).rejects.toThrow(
      'Network error',
    );
  });
});
