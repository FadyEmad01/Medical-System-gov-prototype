'use client';

import { useQuery } from '@tanstack/react-query';
import { useBffQueryError } from '@/features/app-shell/hooks/use-bff-error';
import { bffFetch } from '@/lib/bff';
import type { InsuranceStatusResponse } from '../types';

// Same-origin path (relative to the /api/bff proxy prefix). Matches
// src/features/insurance-status/api/* exactly.
export const INSURANCE_STATUS_PATH = '/api/insurance/status';

export const insuranceStatusKeys = {
  all: ['insurance-status'] as const,
  patient: (patientId: number) =>
    [...insuranceStatusKeys.all, patientId] as const,
};

export function useInsuranceStatus(patientId: number | undefined) {
  const query = useQuery({
    queryKey: insuranceStatusKeys.patient(patientId ?? 0),
    queryFn: () =>
      bffFetch<InsuranceStatusResponse>(
        `${INSURANCE_STATUS_PATH}/${patientId}`,
      ),
    enabled: patientId !== undefined,
  });

  useBffQueryError(query);

  return query;
}
