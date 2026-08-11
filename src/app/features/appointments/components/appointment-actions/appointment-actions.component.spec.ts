import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Permission } from '../../../../core/security/auth.models';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import {
  AppointmentActionsComponent,
  AppointmentLifecycleAction,
} from './appointment-actions.component';

describe('AppointmentActionsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it.each([
    ['PENDING', 'Confirm'],
    ['CONFIRMED', 'Check in'],
    ['CHECKED_IN', 'Start appointment'],
    ['IN_PROGRESS', 'Complete'],
  ] as const)('shows the valid primary action for %s', (status, label) => {
    const fixture = create(status, ['APPOINTMENTS_UPDATE', 'APPOINTMENTS_COMPLETE']);
    expect(fixture.nativeElement.textContent).toContain(label);
  });

  it.each(['COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'] as const)(
    'shows no mutable actions for terminal status %s',
    (status) => {
      const fixture = create(status, [
        'APPOINTMENTS_UPDATE',
        'APPOINTMENTS_CANCEL',
        'APPOINTMENTS_COMPLETE',
      ]);
      expect(fixture.nativeElement.querySelector('button')).toBeNull();
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
    },
  );

  it('enforces permissions and disables actions while saving', () => {
    const denied = create('PENDING', []);
    expect(denied.nativeElement.querySelector('button')).toBeNull();

    const saving = create('PENDING', ['APPOINTMENTS_UPDATE'], 'confirm');
    const button = saving.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('does not emit a second request while saving', () => {
    const fixture = create('PENDING', ['APPOINTMENTS_UPDATE'], 'confirm');
    const emitted: AppointmentLifecycleAction[] = [];
    fixture.componentInstance.actionRequested.subscribe((action) => emitted.push(action));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(emitted).toEqual([]);
  });
});

function create(
  status: AppointmentStatus,
  permissions: readonly Permission[],
  saving: AppointmentLifecycleAction | null = null,
) {
  const fixture = TestBed.createComponent(AppointmentActionsComponent);
  fixture.componentRef.setInput('appointment', appointment(status));
  fixture.componentRef.setInput('permissions', permissions);
  fixture.componentRef.setInput('saving', saving);
  fixture.detectChanges();
  return fixture;
}

function appointment(status: AppointmentStatus): Appointment {
  return {
    id: 8,
    organizationId: 42,
    branchId: 1,
    customerId: 2,
    serviceId: 3,
    specialistId: 4,
    startsAt: '2020-01-01T10:00:00Z',
    endsAt: '2020-01-01T10:30:00Z',
    status,
    origin: 'RECEPTION',
    customerNotes: null,
    internalNotes: null,
    cancellationReason: null,
    cancelledAt: null,
    cancelledBy: null,
    createdBy: 5,
    updatedBy: 5,
    createdAt: '2020-01-01T09:00:00Z',
    updatedAt: '2020-01-01T09:00:00Z',
  };
}
