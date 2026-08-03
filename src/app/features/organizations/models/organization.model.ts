export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface Organization {
  readonly id: number;
  readonly legalName: string;
  readonly tradeName: string | null;
  readonly taxIdentifier: string | null;
  readonly organizationType: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly website: string | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly stateCode: string | null;
  readonly postalCode: string | null;
  readonly countryCode: string;
  readonly logoUrl: string | null;
  readonly timezone: string;
  readonly currencyCode: string;
  readonly languageCode: string;
  readonly allowsPublicBooking: boolean;
  readonly allowsGuestBooking: boolean;
  readonly requiresAppointmentConfirmation: boolean;
  readonly minimumBookingNoticeMinutes: number;
  readonly maximumBookingDaysAhead: number;
  readonly cancellationNoticeMinutes: number;
  readonly status: OrganizationStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// The backend currently returns OrganizationResponse for both list and detail operations.
export type OrganizationSummary = Organization;

export interface CreateOrganizationRequest {
  readonly legalName: string;
  readonly tradeName: string | null;
  readonly taxIdentifier: string | null;
  readonly organizationType: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly website: string | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly stateCode: string | null;
  readonly postalCode: string | null;
  readonly countryCode: string | null;
  readonly logoUrl: string | null;
  readonly timezone: string | null;
  readonly currencyCode: string | null;
  readonly languageCode: string | null;
  readonly allowsPublicBooking: boolean | null;
  readonly allowsGuestBooking: boolean | null;
  readonly requiresAppointmentConfirmation: boolean | null;
  readonly minimumBookingNoticeMinutes: number | null;
  readonly maximumBookingDaysAhead: number | null;
  readonly cancellationNoticeMinutes: number | null;
  readonly status: OrganizationStatus | null;
}

export type UpdateOrganizationRequest = CreateOrganizationRequest;
