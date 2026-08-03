'use client';

import { useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from '@/i18n/navigation';
import { BffError } from '@/lib/bff';

export function isBffError(error: unknown): error is BffError {
  return error instanceof BffError;
}

// Shared BFF error contract for every patient-portal query/mutation:
// a 401 anywhere means the session is dead — log out and return to the login
// page. Other errors are left for callers to surface via ErrorState or toasts.
//
// router.push (not `redirect()`) is used because these handlers run inside
// async callbacks where Next's redirect exception cannot propagate.
export function useBffError() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof BffError && error.status === 401) {
        void logout().then(() => {
          router.push('/auth/login');
          router.refresh();
        });
      }
    },
    [logout, router],
  );

  return handleError;
}
