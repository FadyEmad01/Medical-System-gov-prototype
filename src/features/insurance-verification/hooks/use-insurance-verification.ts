'use client';

import { useQuery } from '@tanstack/react-query';
import { useBffQueryError } from '@/features/app-shell/hooks/use-bff-error';
import { BffError, bffFetch } from '@/lib/bff';
import type { InsuranceVerificationResponse } from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-verification/api/* exactly.
export const INSURANCE_VERIFICATION_PATH = '/api/insurance/verification';

export const verificationKeys = {
  all: ['insurance-verification'] as const,
  latest: (patientId: number) =>
    [...verificationKeys.all, 'latest', patientId] as const,
  current: (patientId: number) =>
    [...verificationKeys.all, 'current', patientId] as const,
};

// A 404 means no verification exists yet — a state (rendered as an
// EmptyState), not an error.
export type VerificationResult =
  | { neverChecked: true }
  | { neverChecked: false; data: InsuranceVerificationResponse };

async function fetchVerification(path: string): Promise<VerificationResult> {
  try {
    const data = await bffFetch<InsuranceVerificationResponse>(path);
    return { neverChecked: false, data } satisfies VerificationResult;
  } catch (error) {
    if (error instanceof BffError && error.status === 404) {
      return { neverChecked: true } satisfies VerificationResult;
    }
    throw error;
  }
}

export function useLatestVerification(patientId: number | undefined) {
  const query = useQuery({
    queryKey: verificationKeys.latest(patientId ?? 0),
    queryFn: () =>
      fetchVerification(`${INSURANCE_VERIFICATION_PATH}/${patientId}/latest`),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}

export function useCurrentVerification(patientId: number | undefined) {
  const query = useQuery({
    queryKey: verificationKeys.current(patientId ?? 0),
    queryFn: () =>
      fetchVerification(`${INSURANCE_VERIFICATION_PATH}/current/${patientId}`),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}
