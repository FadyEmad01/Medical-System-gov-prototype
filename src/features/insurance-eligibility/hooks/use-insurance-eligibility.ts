'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBffError } from '@/features/app-shell/hooks/use-bff-error';
import { BffError, bffFetch } from '@/lib/bff';
import type {
  CheckEligibilityRequest,
  InsuranceEligibilityResponse,
} from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-eligibility/api/* exactly.
export const INSURANCE_ELIGIBILITY_PATH = '/api/insurance/eligibility';

export const eligibilityKeys = {
  all: ['insurance-eligibility'] as const,
  patient: (patientId: number) =>
    [...eligibilityKeys.all, 'patient', patientId] as const,
};

// A 404 means this patient has never been checked — that is a state, not an
// error. The page renders an EmptyState instead of an ErrorState.
export type EligibilityResult =
  | { neverChecked: true }
  | { neverChecked: false; data: InsuranceEligibilityResponse };

export function useEligibility(patientId: number | undefined) {
  const handleError = useBffError();

  return useQuery({
    queryKey: eligibilityKeys.patient(patientId ?? 0),
    queryFn: async () => {
      try {
        const data = await bffFetch<InsuranceEligibilityResponse>(
          `${INSURANCE_ELIGIBILITY_PATH}/${patientId}`,
        );
        return { neverChecked: false, data } satisfies EligibilityResult;
      } catch (error) {
        if (error instanceof BffError && error.status === 404) {
          return { neverChecked: true } satisfies EligibilityResult;
        }
        throw error;
      }
    },
    enabled: patientId !== undefined,
    onError: handleError,
  });
}

export function useCheckEligibility(patientId: number) {
  const handleError = useBffError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckEligibilityRequest) =>
      bffFetch<InsuranceEligibilityResponse>(
        `${INSURANCE_ELIGIBILITY_PATH}/check`,
        { method: 'POST', body: data },
      ),
    onError: handleError,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: eligibilityKeys.patient(patientId),
      });
    },
  });
}
