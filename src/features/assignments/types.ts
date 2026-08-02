export interface DoctorPatientAssignmentResponse {
  assignmentId: string;
  doctorName: string | null;
  patientName: string | null;
  assignedAt: string;
}

export interface AssignedPatientResponse {
  patientId: number;
  fullName: string | null;
  nationalId: string | null;
  mobileNumber: string | null;
  assignedAt: string | null;
}
