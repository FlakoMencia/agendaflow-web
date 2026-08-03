import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../../core/config/api.config';
import { ORGANIZATION_FIXTURE } from '../../../testing/api-fixtures';
import { CreateOrganizationRequest } from '../models/organization.model';
import { OrganizationsApiService } from './organizations-api.service';

describe('OrganizationsApiService', () => {
  let service: OrganizationsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
      ],
    });
    service = TestBed.inject(OrganizationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists organizations with backend pagination parameters', () => {
    service.list({ page: 2, size: 10, sort: 'legalName,desc' }).subscribe();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === 'http://localhost:8080/api/v1/organizations' &&
        candidate.params.get('page') === '2' &&
        candidate.params.get('size') === '10' &&
        candidate.params.get('sort') === 'legalName,desc',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      content: [],
      page: 2,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
    });
  });

  it('gets an organization by numeric identifier', () => {
    service.get(42).subscribe((organization) => expect(organization.id).toBe(42));
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42');
    expect(request.request.method).toBe('GET');
    request.flush(ORGANIZATION_FIXTURE);
  });

  it('creates an organization with the DTO body', () => {
    const body = organizationRequest();
    service.create(body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(ORGANIZATION_FIXTURE);
  });

  it('updates an organization with its identifier and DTO body', () => {
    const body = organizationRequest();
    service.update(42, body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush(ORGANIZATION_FIXTURE);
  });
});

function organizationRequest(): CreateOrganizationRequest {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...request
  } = ORGANIZATION_FIXTURE;
  return request;
}
