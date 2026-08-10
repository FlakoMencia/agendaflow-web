export interface Specialist {
  readonly id: number;
  readonly organizationId: number;
  readonly userId: number | null;
  readonly professionalName: string;
  readonly specialtyName: string | null;
  readonly biography: string | null;
  readonly licenseNumber: string | null;
  readonly photoUrl: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly simultaneousCapacity: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SpecialistRequest {
  readonly userId: number | null;
  readonly professionalName: string;
  readonly specialtyName: string | null;
  readonly biography: string | null;
  readonly licenseNumber: string | null;
  readonly photoUrl: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly simultaneousCapacity: number | null;
  readonly active: boolean | null;
}

export interface SpecialistBranchAssignment {
  readonly specialistId: number;
  readonly branchId: number;
  readonly branchName: string;
  readonly primary: boolean;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface SpecialistBranchAssignmentRequest {
  readonly primary: boolean | null;
  readonly active: boolean | null;
}

export interface SpecialistServiceAssignment {
  readonly specialistId: number;
  readonly serviceId: number;
  readonly serviceName: string;
  readonly customDurationMinutes: number | null;
  readonly customPrice: number | null;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface SpecialistServiceAssignmentRequest {
  readonly customDurationMinutes: number | null;
  readonly customPrice: number | null;
  readonly active: boolean | null;
}
