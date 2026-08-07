import { OrganizationStatus } from '../../features/organizations/models/organization.model';

export const ROLES = [
  'PLATFORM_ADMIN',
  'ORGANIZATION_ADMIN',
  'MANAGER',
  'RECEPTIONIST',
  'SPECIALIST',
  'AUDITOR',
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'ORGANIZATION_VIEW',
  'ORGANIZATION_UPDATE',
  'USERS_VIEW',
  'USERS_MANAGE',
  'ROLES_VIEW',
  'ROLES_MANAGE',
  'BRANCHES_VIEW',
  'BRANCHES_MANAGE',
  'CUSTOMERS_VIEW',
  'CUSTOMERS_CREATE',
  'CUSTOMERS_UPDATE',
  'SERVICES_VIEW',
  'SERVICES_MANAGE',
  'SPECIALISTS_VIEW',
  'SPECIALISTS_MANAGE',
  'SCHEDULE_VIEW',
  'SCHEDULE_MANAGE',
  'APPOINTMENTS_VIEW',
  'APPOINTMENTS_CREATE',
  'APPOINTMENTS_UPDATE',
  'APPOINTMENTS_CANCEL',
  'APPOINTMENTS_COMPLETE',
  'REPORTS_VIEW',
  'AUDIT_VIEW',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly organizationId: number;
}

export interface AuthenticatedUser {
  readonly id: number;
  readonly email: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly preferredLanguage: string;
}

export interface ActiveOrganization {
  readonly id: number;
  readonly legalName: string;
  readonly tradeName: string | null;
  readonly timezone: string;
  readonly languageCode: string;
  readonly status: OrganizationStatus;
}

export interface CurrentSession {
  readonly membershipId: number;
  readonly user: AuthenticatedUser;
  readonly activeOrganization: ActiveOrganization;
  readonly roles: readonly Role[];
  readonly permissions: readonly Permission[];
}

export interface LoginResponse extends CurrentSession {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
}

export type AuthSessionState = 'initial' | 'authenticating' | 'authenticated' | 'unauthenticated';
