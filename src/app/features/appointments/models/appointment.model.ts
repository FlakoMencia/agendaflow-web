import { PageRequest } from '../../../core/http/page-response.model';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type AppointmentOrigin =
  'PUBLIC_PORTAL' | 'CUSTOMER_PORTAL' | 'RECEPTION' | 'PHONE' | 'ADMINISTRATION' | 'IMPORT';

export interface Appointment {
  readonly id: number;
  readonly organizationId: number;
  readonly branchId: number;
  readonly customerId: number;
  readonly serviceId: number;
  readonly specialistId: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: AppointmentStatus;
  readonly origin: AppointmentOrigin;
  readonly customerNotes: string | null;
  readonly internalNotes: string | null;
  readonly cancellationReason: string | null;
  readonly cancelledAt: string | null;
  readonly cancelledBy: number | null;
  readonly createdBy: number | null;
  readonly updatedBy: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type AppointmentSummary = Appointment;

export interface CreateAppointmentRequest {
  readonly customerId: number;
  readonly branchId: number;
  readonly serviceId: number;
  readonly specialistId: number;
  readonly startsAt: string;
  readonly customerNotes: string | null;
  readonly internalNotes: string | null;
}

export interface RescheduleAppointmentRequest {
  readonly startsAt: string;
  readonly specialistId: number | null;
  readonly reason: string | null;
}

export interface CancelAppointmentRequest {
  readonly reason: string | null;
}

export interface AppointmentHistoryEntry {
  readonly id: number;
  readonly previousStatus: AppointmentStatus | null;
  readonly newStatus: AppointmentStatus;
  readonly changedBy: number | null;
  readonly changeReason: string | null;
  readonly changedAt: string;
}

export interface AppointmentListRequest extends PageRequest {
  readonly from?: string;
  readonly to?: string;
  readonly branchId?: number;
  readonly specialistId?: number;
  readonly customerId?: number;
  readonly status?: AppointmentStatus;
}

export interface AvailableSlot {
  readonly specialistId: number;
  readonly start: string;
  readonly end: string;
}

export interface AvailableSlotsResponse {
  readonly date: string;
  readonly branchId: number;
  readonly serviceId: number;
  readonly timezone: string;
  readonly slots: readonly AvailableSlot[];
}

export interface AvailableSlotsRequest {
  readonly branchId: number;
  readonly serviceId: number;
  readonly date: string;
  readonly specialistId?: number;
}
