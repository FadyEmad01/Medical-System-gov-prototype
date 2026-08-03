import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Guard rail: the BFF-side hook path constants must stay in lockstep with the
// backend-facing api-layer clients. Both files are read at test time; each
// literal must appear verbatim in the hook source (where the constant is
// defined) AND in the api client source (where the request path lives).
const SOURCE_ROOT = resolve(process.cwd(), 'src', 'features');

const HOOK_PATHS = {
  profile: '/api/profile',
  patientVisits: '/api/patients',
  visit: '/api/visits',
  insuranceStatus: '/api/insurance/status',
  insuranceCards: '/api/insurance/cards',
  insuranceApplications: '/api/insurance/applications',
  insuranceDependents: '/api/insurance/dependents',
  insuranceDocuments: '/api/insurance/documents',
  insuranceEligibility: '/api/insurance/eligibility',
  insuranceVerification: '/api/insurance/verification',
  assignments: '/api/doctors',
  patients: '/api/patients',
  visitAttachments: '/api/visits',
  attachments: '/api/attachments',
  audit: '/api/audit',
} as const;

function readSource(feature: string, fileName: string): string {
  return readFileSync(resolve(SOURCE_ROOT, feature, fileName), 'utf8');
}

function expectPathInHook(feature: string, hookFileName: string, path: string) {
  expect(
    readSource(feature, hookFileName),
    `hook ${feature}/${hookFileName} must define ${path}`,
  ).toContain(path);
}

function expectPathInApi(feature: string, apiFileName: string, path: string) {
  expect(
    readSource(feature, `api/${apiFileName}`),
    `api ${feature}/${apiFileName} must call ${path}`,
  ).toContain(path);
}

describe('api path spot-check', () => {
  it('profile hooks match the api client', () => {
    expectPathInHook('profile', 'hooks/use-profile.ts', HOOK_PATHS.profile);
    expectPathInApi('profile', 'get-profile.ts', HOOK_PATHS.profile);
    expectPathInApi('profile', 'update-profile.ts', HOOK_PATHS.profile);
  });

  it('visits hooks match the api client', () => {
    expectPathInHook('visits', 'hooks/use-visits.ts', HOOK_PATHS.patientVisits);
    expectPathInApi(
      'visits',
      'get-patient-visits.ts',
      HOOK_PATHS.patientVisits,
    );
    expectPathInHook('visits', 'hooks/use-visits.ts', HOOK_PATHS.visit);
    expectPathInApi('visits', 'get-visit.ts', HOOK_PATHS.visit);
    // use-visit-actions.ts reuses VISITS_PATH from use-visits.ts, so the
    // verbatim path assertions target the api clients it drives.
    for (const apiFile of [
      'create-visit.ts',
      'get-visit.ts',
      'update-visit.ts',
      'update-visit-status.ts',
      'add-visit-medications.ts',
    ]) {
      expectPathInApi('visits', apiFile, HOOK_PATHS.visit);
    }
  });

  it('assignments hooks match the api client', () => {
    expectPathInHook(
      'assignments',
      'hooks/use-assignments.ts',
      HOOK_PATHS.assignments,
    );
    for (const apiFile of [
      'get-assigned-patients.ts',
      'create-assignment.ts',
      'delete-assignment.ts',
    ]) {
      expectPathInApi('assignments', apiFile, HOOK_PATHS.assignments);
    }
  });

  it('patients hooks match the api client', () => {
    expectPathInHook('patients', 'hooks/use-patients.ts', HOOK_PATHS.patients);
    for (const apiFile of [
      'search-patients.ts',
      'get-patient-medical-summary.ts',
      'get-patient-visit-history.ts',
    ]) {
      expectPathInApi('patients', apiFile, HOOK_PATHS.patients);
    }
  });

  it('attachments hooks match the api client', () => {
    expectPathInHook(
      'attachments',
      'hooks/use-attachments.ts',
      HOOK_PATHS.visitAttachments,
    );
    for (const apiFile of [
      'get-visit-attachments.ts',
      'upload-attachment.ts',
    ]) {
      expectPathInApi('attachments', apiFile, HOOK_PATHS.visitAttachments);
    }
    expectPathInHook(
      'attachments',
      'hooks/use-attachments.ts',
      HOOK_PATHS.attachments,
    );
    expectPathInApi('attachments', 'get-attachment.ts', HOOK_PATHS.attachments);
  });

  it('insurance-status hooks match the api client', () => {
    expectPathInHook(
      'insurance-status',
      'hooks/use-insurance-status.ts',
      HOOK_PATHS.insuranceStatus,
    );
    expectPathInApi(
      'insurance-status',
      'get-insurance-status.ts',
      HOOK_PATHS.insuranceStatus,
    );
  });

  it('insurance-cards hooks match the api client', () => {
    expectPathInHook(
      'insurance-cards',
      'hooks/use-insurance-cards.ts',
      HOOK_PATHS.insuranceCards,
    );
    for (const apiFile of [
      'get-patient-cards.ts',
      'get-current-card.ts',
      'get-card-detail.ts',
      'suspend-card.ts',
      'reactivate-card.ts',
      'revoke-card.ts',
      'renew-card.ts',
      'replace-card.ts',
      'rotate-card-token.ts',
    ]) {
      expectPathInApi('insurance-cards', apiFile, HOOK_PATHS.insuranceCards);
    }
  });

  it('insurance-applications hooks match the api client', () => {
    expectPathInHook(
      'insurance-applications',
      'hooks/use-insurance-applications.ts',
      HOOK_PATHS.insuranceApplications,
    );
    for (const apiFile of [
      'get-patient-applications.ts',
      'get-application-detail.ts',
      'create-application.ts',
      'submit-application.ts',
      'cancel-application.ts',
    ]) {
      expectPathInApi(
        'insurance-applications',
        apiFile,
        HOOK_PATHS.insuranceApplications,
      );
    }
  });

  it('insurance-dependents hooks match the api client', () => {
    expectPathInHook(
      'insurance-dependents',
      'hooks/use-insurance-dependents.ts',
      HOOK_PATHS.insuranceDependents,
    );
    for (const apiFile of [
      'get-patient-dependents.ts',
      'add-dependent.ts',
      'end-dependent-relationship.ts',
    ]) {
      expectPathInApi(
        'insurance-dependents',
        apiFile,
        HOOK_PATHS.insuranceDependents,
      );
    }
  });

  it('insurance-documents hooks match the api client', () => {
    expectPathInHook(
      'insurance-documents',
      'hooks/use-insurance-documents.ts',
      HOOK_PATHS.insuranceDocuments,
    );
    for (const apiFile of ['get-patient-documents.ts', 'upload-document.ts']) {
      expectPathInApi(
        'insurance-documents',
        apiFile,
        HOOK_PATHS.insuranceDocuments,
      );
    }
  });

  it('insurance-eligibility hooks match the api client', () => {
    expectPathInHook(
      'insurance-eligibility',
      'hooks/use-insurance-eligibility.ts',
      HOOK_PATHS.insuranceEligibility,
    );
    for (const apiFile of ['get-eligibility.ts', 'check-eligibility.ts']) {
      expectPathInApi(
        'insurance-eligibility',
        apiFile,
        HOOK_PATHS.insuranceEligibility,
      );
    }
  });

  it('audit hooks match the api client', () => {
    expectPathInHook('admin', 'hooks/use-audit-logs.ts', HOOK_PATHS.audit);
    expectPathInApi('audit-logs', 'get-audit-logs.ts', HOOK_PATHS.audit);
    expectPathInApi('audit-logs', 'get-audit-log.ts', HOOK_PATHS.audit);
    expectPathInApi(
      'audit-logs',
      'get-audit-dashboard.ts',
      '/api/audit/dashboard',
    );
    expectPathInApi('audit-logs', 'verify-audit-chain.ts', '/api/audit/verify');
  });

  it('insurance-verification hooks match the api client', () => {
    expectPathInHook(
      'insurance-verification',
      'hooks/use-insurance-verification.ts',
      HOOK_PATHS.insuranceVerification,
    );
    for (const apiFile of [
      'get-latest-verification.ts',
      'get-current-verification.ts',
    ]) {
      expectPathInApi(
        'insurance-verification',
        apiFile,
        HOOK_PATHS.insuranceVerification,
      );
    }
  });
});
