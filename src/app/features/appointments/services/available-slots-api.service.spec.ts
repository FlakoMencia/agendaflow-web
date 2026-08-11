import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG } from '../../../core/config/api.config';
import { AvailableSlotsApiService } from './available-slots-api.service';
describe('AvailableSlotsApiService', () => {
  let service: AvailableSlotsApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://api/api/v1' } },
      ],
    });
    service = TestBed.inject(AvailableSlotsApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('requests real backend slots with the optional specialist', () => {
    service.list(7, { branchId: 2, serviceId: 3, date: '2026-08-12', specialistId: 4 }).subscribe();
    const request = http.expectOne(
      (r) => r.url === 'http://api/api/v1/organizations/7/availability/slots',
    );
    expect(request.request.params.get('date')).toBe('2026-08-12');
    expect(request.request.params.get('specialistId')).toBe('4');
    request.flush({
      date: '2026-08-12',
      branchId: 2,
      serviceId: 3,
      timezone: 'America/El_Salvador',
      slots: [],
    });
  });
});
