export interface AvailabilitySchedule {
  readonly id: number;
  readonly organizationId: number;
  readonly specialistId: number;
  readonly branchId: number;
  readonly dayOfWeek: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly validFrom: string | null;
  readonly validUntil: string | null;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AvailabilityRequest {
  readonly branchId: number;
  readonly dayOfWeek: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly validFrom: string | null;
  readonly validUntil: string | null;
  readonly active: boolean | null;
}

export const SCHEDULE_BLOCK_TYPES = [
  'BREAK',
  'VACATION',
  'HOLIDAY',
  'SICK_LEAVE',
  'PERSONAL',
  'MEETING',
  'MAINTENANCE',
  'OTHER',
] as const;

export type ScheduleBlockType = (typeof SCHEDULE_BLOCK_TYPES)[number];

export interface ScheduleBlock {
  readonly id: number;
  readonly organizationId: number;
  readonly specialistId: number;
  readonly branchId: number | null;
  readonly blockType: ScheduleBlockType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly reason: string | null;
  readonly active: boolean;
  readonly createdBy: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ScheduleBlockRequest {
  readonly branchId: number | null;
  readonly blockType: ScheduleBlockType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly reason: string | null;
  readonly active: boolean | null;
}
