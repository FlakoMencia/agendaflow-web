import { PageResponse } from '../core/http/page-response.model';
import { Branch } from '../features/branches/models/branch.model';
import { Organization } from '../features/organizations/models/organization.model';

export const ORGANIZATION_FIXTURE: Organization = {
  id: 42,
  legalName: 'AgendaFlow Test Organization',
  tradeName: 'AgendaFlow Test',
  taxIdentifier: 'TEST-42',
  organizationType: 'TEST',
  email: 'test@example.com',
  phone: '+1 555 0100',
  website: null,
  addressLine1: '42 Test Street',
  addressLine2: null,
  city: 'Test City',
  stateCode: 'TS',
  postalCode: '00042',
  countryCode: 'US',
  logoUrl: null,
  timezone: 'America/New_York',
  currencyCode: 'USD',
  languageCode: 'en-US',
  allowsPublicBooking: true,
  allowsGuestBooking: true,
  requiresAppointmentConfirmation: false,
  minimumBookingNoticeMinutes: 0,
  maximumBookingDaysAhead: 365,
  cancellationNoticeMinutes: 0,
  status: 'ACTIVE',
  createdAt: '2026-08-03T10:00:00Z',
  updatedAt: '2026-08-03T10:00:00Z',
};

export const BRANCH_FIXTURE: Branch = {
  id: 7,
  organizationId: ORGANIZATION_FIXTURE.id,
  name: 'Test Branch',
  code: 'TEST',
  email: 'branch@example.com',
  phone: '+1 555 0101',
  addressLine1: '7 Branch Street',
  addressLine2: null,
  city: 'Test City',
  stateCode: 'TS',
  postalCode: '00007',
  countryCode: 'US',
  timezone: 'America/New_York',
  latitude: 40.7128,
  longitude: -74.006,
  active: true,
  createdAt: '2026-08-03T10:00:00Z',
  updatedAt: '2026-08-03T10:00:00Z',
};

export function pageResponse<T>(content: readonly T[]): PageResponse<T> {
  return {
    content,
    page: 0,
    size: 20,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    first: true,
    last: true,
  };
}
