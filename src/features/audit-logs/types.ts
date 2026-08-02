import type {
  AuditCategory,
  AuditDeviceType,
  AuditFailureReason,
  AuditPlatform,
  AuditRiskLevel,
} from '@/lib/api/enums';

export interface AuditLogListItem {
  auditId: string;
  timestampUtc: string;
  userId: number | null;
  userName: string | null;
  role: string | null;
  action: string | null;
  category: AuditCategory;
  patientId: number | null;
  visitId: string | null;
  success: boolean;
  statusCode: number | null;
  executionTimeMs: number | null;
  riskLevel: AuditRiskLevel;
  failureReason: AuditFailureReason;
}

export type AuditLogQuery = {
  userId?: number;
  patientId?: number;
  visitId?: string;
  category?: AuditCategory;
  action?: string;
  success?: boolean;
  riskLevel?: AuditRiskLevel;
  failureReason?: AuditFailureReason;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?:
    | 'TimestampUtc'
    | 'Action'
    | 'Category'
    | 'Success'
    | 'StatusCode'
    | 'ExecutionTimeMs';
  sortDescending?: boolean;
};

export interface AuditLogDetail extends AuditLogListItem {
  userNationalId: string | null;
  resourceType: string | null;
  resourceId: string | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  requestPath: string | null;
  httpMethod: string | null;
  browser: string | null;
  browserVersion: string | null;
  operatingSystem: string | null;
  operatingSystemVersion: string | null;
  deviceType: AuditDeviceType;
  platform: AuditPlatform;
  sessionId: string | null;
  oldValuesJson: string | null;
  newValuesJson: string | null;
  additionalDataJson: string | null;
  previousAuditId: string | null;
  nextAuditId: string | null;
  previousHash: string | null;
  currentHash: string | null;
}

export interface AuditChainVerificationResult {
  isValid: boolean;
  brokenRecordId: string | null;
  brokenTimestamp: string | null;
  totalRecordsChecked: number;
  verificationDurationMs: number;
}

export interface AuditTopUser {
  userId: number;
  userName: string | null;
  actionCount: number;
}

export interface AuditTopPatient {
  patientId: number;
  accessCount: number;
}

export interface AuditActionCount {
  action: string | null;
  count: number;
}

export interface AuditDashboard {
  totalRecords: number;
  successfulOperations: number;
  failedOperations: number;
  criticalEvents: number;
  topActiveUsers: AuditTopUser[] | null;
  topAccessedPatients: AuditTopPatient[] | null;
  mostCommonActions: AuditActionCount[] | null;
  actionsToday: number;
  averageExecutionTimeMs: number | null;
  lastAuditTimestamp: string | null;
}
