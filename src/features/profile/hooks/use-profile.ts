'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBffError } from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type { ProfileResponse, UpdateProfileRequest } from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/profile/api/* exactly.
export const PROFILE_PATH = '/api/profile';

export const profileKeys = {
  all: ['profile'] as const,
};

export function useProfile() {
  const handleError = useBffError();

  return useQuery({
    queryKey: profileKeys.all,
    queryFn: () => bffFetch<ProfileResponse>(PROFILE_PATH),
    onError: handleError,
  });
}

export function useUpdateProfile() {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      bffFetch<ProfileResponse>(PROFILE_PATH, {
        method: 'PUT',
        body: data,
      }),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
