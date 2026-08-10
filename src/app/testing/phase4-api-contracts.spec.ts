import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../core/config/api.config';
import { AvailabilityRequest, ScheduleBlockRequest } from '../features/specialists/models/scheduling.model';
import { SpecialistRequest } from '../features/specialists/models/specialist.model';
import { AvailabilityApiService } from '../features/specialists/services/availability-api.service';
import { SpecialistsApiService } from '../features/specialists/services/specialists-api.service';
import { CatalogServiceRequest, ServiceCategoryRequest } from '../features/services/models/service-catalog.model';
import { ServiceCategoriesApiService } from '../features/services/services/service-categories-api.service';
import { ServicesApiService } from '../features/services/services/services-api.service';

describe('Phase 4 API contracts', () => {
  let http: HttpTestingController;
  let categories: ServiceCategoriesApiService;
  let services: ServicesApiService;
  let specialists: SpecialistsApiService;
  let availability: AvailabilityApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    categories = TestBed.inject(ServiceCategoriesApiService);
    services = TestBed.inject(ServicesApiService);
    specialists = TestBed.inject(SpecialistsApiService);
    availability = TestBed.inject(AvailabilityApiService);
  });

  afterEach(() => http.verify());

  it('uses the organization-scoped category endpoints and payload', () => {
    categories.list(42).subscribe();
    const list = http.expectOne('http://localhost:8080/api/v1/organizations/42/service-categories');
    expect(list.request.method).toBe('GET');
    list.flush([]);

    const body: ServiceCategoryRequest = { name: 'Consulting', description: null, active: true };
    categories.create(42, body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42/service-categories');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('sends service pagination and branch assignments to the real URLs', () => {
    services.list(42, { page: 2, size: 10, sort: 'name,asc' }).subscribe();
    const list = http.expectOne((candidate) => candidate.url.endsWith('/organizations/42/services'));
    expect(list.request.method).toBe('GET');
    expect(list.request.params.get('page')).toBe('2');
    expect(list.request.params.get('size')).toBe('10');
    expect(list.request.params.get('sort')).toBe('name,asc');
    list.flush({ content: [], page: 2, size: 10, totalElements: 0, totalPages: 0, first: false, last: true });

    services.assignBranch(42, 7, 9, { active: true }).subscribe();
    const assignment = http.expectOne('http://localhost:8080/api/v1/organizations/42/branches/7/services/9');
    expect(assignment.request.method).toBe('PUT');
    expect(assignment.request.body).toEqual({ active: true });
    assignment.flush({});
  });

  it('uses specialist CRUD and assignment contracts without adding an organization selector', () => {
    const body: SpecialistRequest = { userId: null, professionalName: 'Ada Lovelace', specialtyName: 'Consulting', biography: null, licenseNumber: null, photoUrl: null, phone: null, email: 'ada@example.com', simultaneousCapacity: 1, active: true };
    specialists.update(42, 8, body).subscribe();
    const update = http.expectOne('http://localhost:8080/api/v1/organizations/42/specialists/8');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(body);
    update.flush({});

    specialists.assignService(42, 8, 9, { customDurationMinutes: 45, customPrice: 75, active: true }).subscribe();
    const assignment = http.expectOne('http://localhost:8080/api/v1/organizations/42/specialists/8/services/9');
    expect(assignment.request.method).toBe('PUT');
    expect(assignment.request.body).toEqual({ customDurationMinutes: 45, customPrice: 75, active: true });
    assignment.flush({});

    specialists.assignBranch(42, 8, 7, { primary: true, active: true }).subscribe();
    const branchAssignment = http.expectOne('http://localhost:8080/api/v1/organizations/42/specialists/8/branches/7');
    expect(branchAssignment.request.method).toBe('PUT');
    expect(branchAssignment.request.body).toEqual({ primary: true, active: true });
    branchAssignment.flush({});
  });

  it('uses availability and paginated schedule-block endpoints', () => {
    const schedule: AvailabilityRequest = { branchId: 7, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', validFrom: null, validUntil: null, active: true };
    availability.createAvailability(42, 8, schedule).subscribe();
    const create = http.expectOne('http://localhost:8080/api/v1/organizations/42/specialists/8/availability');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(schedule);
    create.flush({});

    availability.listBlocks(42, 8, { page: 1, size: 5 }).subscribe();
    const blocks = http.expectOne((candidate) => candidate.url.endsWith('/organizations/42/specialists/8/schedule-blocks'));
    expect(blocks.request.params.get('page')).toBe('1');
    expect(blocks.request.params.get('size')).toBe('5');
    blocks.flush({ content: [], page: 1, size: 5, totalElements: 0, totalPages: 0, first: false, last: true });
  });

  it.each([403, 404, 409])('preserves HTTP %s errors for the shared mapper', (status) => {
    let receivedStatus = 0;
    services.get(42, 9).subscribe({ error: (error: HttpErrorResponse) => { receivedStatus = error.status; } });
    http.expectOne('http://localhost:8080/api/v1/organizations/42/services/9').flush({ code: 'TEST_ERROR' }, { status, statusText: 'Error' });
    expect(receivedStatus).toBe(status);
  });

  it('sends a schedule block payload without changing its offset timestamps', () => {
    const body: ScheduleBlockRequest = { branchId: null, blockType: 'VACATION', startsAt: '2026-08-10T08:00:00Z', endsAt: '2026-08-11T08:00:00Z', reason: 'Planned', active: true };
    availability.createBlock(42, 8, body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42/specialists/8/schedule-blocks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });

  it('sends the service create payload unchanged', () => {
    const body: CatalogServiceRequest = { categoryId: null, name: 'Consultation', description: null, durationMinutes: 30, preparationMinutes: 0, cleanupMinutes: 0, price: 50, currencyCode: 'USD', requiresApproval: false, allowsOnlineBooking: true, active: true, colorCode: '#0F766E' };
    services.create(42, body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42/services');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({});
  });
});
