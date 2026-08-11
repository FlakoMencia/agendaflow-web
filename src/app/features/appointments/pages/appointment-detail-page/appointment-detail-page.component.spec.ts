import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ServicesApiService } from '../../../services/services/services-api.service';
import { SpecialistsApiService } from '../../../specialists/services/specialists-api.service';
import { Appointment, AppointmentHistoryEntry, AppointmentStatus } from '../../models/appointment.model';
import { AppointmentsApiService } from '../../services/appointments-api.service';
import { AppointmentDetailPageComponent } from './appointment-detail-page.component';

describe('AppointmentDetailPageComponent lifecycle', () => {
  let api: AppointmentsStub;

  beforeEach(() => {
    api = new AppointmentsStub();
    TestBed.configureTestingModule({
      imports: [AppointmentDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ appointmentId: 8 }) } } },
        { provide: AuthSessionService, useValue: new AuthSessionStub() },
        { provide: AppointmentsApiService, useValue: api },
        { provide: BranchesApiService, useValue: {} },
        { provide: CustomersApiService, useValue: {} },
        { provide: ServicesApiService, useValue: {} },
        { provide: SpecialistsApiService, useValue: {} },
      ],
    });
  });

  it('updates appointment and history through the operational lifecycle', () => {
    const component = create('PENDING');
    component.requestLifecycle('confirm');
    expect(component.appointment()?.status).toBe('CONFIRMED');
    component.requestLifecycle('checkIn');
    expect(component.appointment()?.status).toBe('CHECKED_IN');
    component.requestLifecycle('start');
    expect(component.appointment()?.status).toBe('IN_PROGRESS');
    component.requestLifecycle('complete');
    expect(component.pendingConfirmation()).toBe('complete');
    component.confirmLifecycle();
    expect(component.appointment()?.status).toBe('COMPLETED');
    expect(component.history()[0]?.newStatus).toBe('COMPLETED');
  });

  it('confirms the no-show terminal action', () => {
    const component = create('CONFIRMED');
    component.requestLifecycle('noShow');
    component.confirmLifecycle();
    expect(component.appointment()?.status).toBe('NO_SHOW');
    expect(component.successMessage()).toContain('no-show');
  });

  it('keeps the error and refreshes current state after an invalid transition', () => {
    api.confirmResponse = throwError(
      () => new HttpErrorResponse({ status: 409, error: { code: 'INVALID_APPOINTMENT_TRANSITION' } }),
    );
    const component = create('PENDING');
    api.current = appointment('CONFIRMED');
    component.requestLifecycle('confirm');
    expect(component.actionError()?.code).toBe('INVALID_APPOINTMENT_TRANSITION');
    expect(component.appointment()?.status).toBe('CONFIRMED');
  });

  it('does not mutate local state when lifecycle authorization fails', () => {
    api.confirmResponse = throwError(
      () => new HttpErrorResponse({ status: 403, error: { code: 'ACCESS_DENIED' } }),
    );
    const component = create('PENDING');
    component.requestLifecycle('confirm');
    expect(component.actionError()?.status).toBe(403);
    expect(component.appointment()?.status).toBe('PENDING');
  });

  function create(status: AppointmentStatus): AppointmentDetailPageComponent {
    api.current = appointment(status);
    const component = TestBed.createComponent(AppointmentDetailPageComponent).componentInstance;
    component.appointment.set(api.current);
    return component;
  }
});

class AppointmentsStub {
  current = appointment('PENDING');
  confirmResponse: Observable<Appointment> | null = null;
  private entries: AppointmentHistoryEntry[] = [];

  get(): Observable<Appointment> { return of(this.current); }
  history(): Observable<readonly AppointmentHistoryEntry[]> { return of(this.entries); }
  confirm(): Observable<Appointment> { return this.confirmResponse ?? this.transition('CONFIRMED'); }
  checkIn(): Observable<Appointment> { return this.transition('CHECKED_IN'); }
  start(): Observable<Appointment> { return this.transition('IN_PROGRESS'); }
  complete(): Observable<Appointment> { return this.transition('COMPLETED'); }
  markNoShow(): Observable<Appointment> { return this.transition('NO_SHOW'); }
  cancel(): Observable<Appointment> { return this.transition('CANCELLED'); }

  private transition(status: AppointmentStatus): Observable<Appointment> {
    const previousStatus = this.current.status;
    this.current = { ...this.current, status };
    this.entries = [
      {
        id: this.entries.length + 1,
        previousStatus,
        newStatus: status,
        changedBy: 5,
        changeReason: null,
        changedAt: new Date(Date.now() + this.entries.length).toISOString(),
      },
      ...this.entries,
    ];
    return of(this.current);
  }
}

function appointment(status: AppointmentStatus): Appointment {
  return {
    id: 8, organizationId: 42, branchId: 1, customerId: 2, serviceId: 3, specialistId: 4,
    startsAt: '2020-01-01T10:00:00Z', endsAt: '2020-01-01T10:30:00Z', status,
    origin: 'RECEPTION', customerNotes: null, internalNotes: null, cancellationReason: null,
    cancelledAt: null, cancelledBy: null, createdBy: 5, updatedBy: 5,
    createdAt: '2020-01-01T09:00:00Z', updatedAt: '2020-01-01T09:00:00Z',
  };
}
