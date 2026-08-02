export type UserRole = 'Patient' | 'Doctor' | 'Admin';

export type Gender = 'Male' | 'Female';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export type VisitType = 'Consultation' | 'FollowUp' | 'Emergency';

export type VisitStatus =
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export type AuditCategory =
  | 'Authentication'
  | 'Patient'
  | 'Visit'
  | 'Medication'
  | 'Attachment'
  | 'Assignment'
  | 'Administration'
  | 'Insurance';

export type AuditRiskLevel =
  | 'Information'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical';

export type AuditFailureReason =
  | 'InvalidCredentials'
  | 'Unauthorized'
  | 'Forbidden'
  | 'ValidationFailed'
  | 'PatientNotAssigned'
  | 'PatientNotFound'
  | 'VisitNotFound'
  | 'AttachmentNotFound'
  | 'BusinessRuleViolation'
  | 'Unknown';

export type AuditDeviceType = 'Desktop' | 'Tablet' | 'Mobile' | 'Unknown';

export type AuditPlatform =
  | 'Windows'
  | 'Linux'
  | 'Mac'
  | 'Android'
  | 'iOS'
  | 'Unknown';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'WaitingForDocuments'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export type ReviewOutcome = 'Approved' | 'Rejected' | 'NeedMoreDocuments';

export type SubmissionChannel =
  | 'WebPortal'
  | 'MobileApp'
  | 'AdminPortal'
  | 'Kiosk'
  | 'GovernmentImport';

export type EligibilityStatus =
  | 'Eligible'
  | 'NotEligible'
  | 'PendingReview'
  | 'Suspended'
  | 'Expired';

export type VerificationStatus = 'Verified' | 'NotVerified' | 'Pending';

export type VerificationContext =
  | 'Appointment'
  | 'CheckIn'
  | 'ClinicVisit'
  | 'EmergencyAdmission'
  | 'Billing';

export type VerificationSource =
  | 'Manual'
  | 'GovernmentApi'
  | 'Imported'
  | 'System';

export type RelationshipType = 'Spouse' | 'Child' | 'Parent' | 'Guardian';

export type DependentStatus = 'Active' | 'Inactive' | 'Deceased';

export type DocumentType =
  | 'NationalId'
  | 'BirthCertificate'
  | 'MarriageCertificate'
  | 'EmploymentLetter'
  | 'DisabilityCertificate'
  | 'DeathCertificate'
  | 'GuardianAuthorization'
  | 'FamilyRegistration';

export type DocumentReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export type CardStatus = 'Active' | 'Suspended' | 'Revoked' | 'Superseded';

export type IssueReason =
  | 'Initial'
  | 'Renewal'
  | 'Replacement'
  | 'Dependent'
  | 'Migration';

export type ReplacementReason = 'Lost' | 'Damaged' | 'Stolen' | 'Other';
