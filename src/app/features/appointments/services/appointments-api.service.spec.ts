import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG } from '../../../core/config/api.config';
import { AppointmentsApiService } from './appointments-api.service';
describe('AppointmentsApiService', () => {
  let service: AppointmentsApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://api/api/v1' } },
      ],
    });
    service = TestBed.inject(AppointmentsApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends agenda filters only when present', () => {
    service
      .list(4, {
        from: '2026-08-10T00:00:00Z',
        to: '2026-08-11T00:00:00Z',
        branchId: 2,
        specialistId: 3,
        customerId: 5,
        status: 'CONFIRMED',
      })
      .subscribe();
    const r = http.expectOne((x) => x.url === 'http://api/api/v1/organizations/4/appointments');
    expect(r.request.params.get('branchId')).toBe('2');
    expect(r.request.params.get('status')).toBe('CONFIRMED');
    r.flush({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
  });
  it('uses exact create, detail, reschedule, cancel and history contracts', () => {
    const create = {
      customerId: 1,
      branchId: 2,
      serviceId: 3,
      specialistId: 4,
      startsAt: '2026-08-10T16:00:00Z',
      customerNotes: null,
      internalNotes: null,
    };
    service.create(4, create).subscribe();
    expect(http.expectOne('http://api/api/v1/organizations/4/appointments').request.body).toEqual(
      create,
    );
    service.get(4, 8).subscribe();
    http.expectOne('http://api/api/v1/organizations/4/appointments/8').flush({});
    service
      .reschedule(4, 8, { startsAt: create.startsAt, specialistId: 4, reason: 'Requested' })
      .subscribe();
    expect(
      http.expectOne('http://api/api/v1/organizations/4/appointments/8/reschedule').request.method,
    ).toBe('POST');
    service.cancel(4, 8, { reason: null }).subscribe();
    http.expectOne('http://api/api/v1/organizations/4/appointments/8/cancel').flush({});
    service.history(4, 8).subscribe();
    http.expectOne('http://api/api/v1/organizations/4/appointments/8/history').flush([]);
  });
  it('uses organization-scoped lifecycle endpoints', () => {
    const actions: readonly [() => void, string][] = [
      [() => service.confirm(4, 8).subscribe(), 'confirm'],
      [() => service.checkIn(4, 8).subscribe(), 'check-in'],
      [() => service.start(4, 8).subscribe(), 'start'],
      [() => service.complete(4, 8).subscribe(), 'complete'],
      [() => service.markNoShow(4, 8).subscribe(), 'no-show'],
    ];
    for (const [invoke, action] of actions) {
      invoke();
      const request = http.expectOne(
        `http://api/api/v1/organizations/4/appointments/8/${action}`,
      ).request;
      expect(request.method).toBe('POST');
      expect(request.body).toBeNull();
    }
  });
});
