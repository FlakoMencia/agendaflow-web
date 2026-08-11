import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG } from '../../../core/config/api.config';
import { CustomerRequest } from '../models/customer.model';
import { CustomersApiService } from './customers-api.service';

describe('CustomersApiService', () => {
  let service: CustomersApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://api/api/v1' } },
      ],
    });
    service = TestBed.inject(CustomersApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses the organization-scoped customer collection and paging', () => {
    service.list(9, { page: 2, size: 10 }).subscribe();
    const request = http.expectOne((r) => r.url === 'http://api/api/v1/organizations/9/customers');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('sort')).toBe('lastName,asc');
    request.flush(page());
  });
  it('gets, creates and updates customers with the backend URLs', () => {
    service.get(9, 3).subscribe();
    http.expectOne('http://api/api/v1/organizations/9/customers/3').flush({});
    const body = customerRequest();
    service.create(9, body).subscribe();
    const create = http.expectOne('http://api/api/v1/organizations/9/customers');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush({});
    service.update(9, 3, body).subscribe();
    const update = http.expectOne('http://api/api/v1/organizations/9/customers/3');
    expect(update.request.method).toBe('PUT');
    update.flush({});
  });
});
function page() {
  return {
    content: [],
    page: 2,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: false,
    last: true,
  };
}
function customerRequest(): CustomerRequest {
  return {
    customerNumber: null,
    firstName: 'Ana',
    middleName: null,
    lastName: 'Ramos',
    secondLastName: null,
    email: null,
    phone: null,
    alternatePhone: null,
    dateOfBirth: null,
    preferredLanguage: null,
    preferredContactMethod: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    stateCode: null,
    postalCode: null,
    countryCode: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactRelationship: null,
    emailConsent: false,
    smsConsent: true,
    marketingConsent: false,
    termsAcceptedAt: null,
    privacyPolicyAcceptedAt: null,
    internalNotes: null,
    active: true,
  };
}
