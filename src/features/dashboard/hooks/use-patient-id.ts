'use client';

import { useProfile } from '@/features/profile/hooks/use-profile';

// Patient-scoped endpoints are addressed by patientId, which is only exposed
// by the profile endpoint. Centralizing the wiring here lets every patient
// page pass `patientId` straight into its feature hooks.
export function usePatientId() {
  const profileQuery = useProfile();

  return {
    patientId: profileQuery.data?.patientId,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
  };
}
