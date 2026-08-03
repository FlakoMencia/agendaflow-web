import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../../../core/config/api.config';
import { BRANCH_FIXTURE } from '../../../testing/api-fixtures';
import { CreateBranchRequest } from '../models/branch.model';
import { BranchesApiService } from './branches-api.service';

describe('BranchesApiService', () => {
  let service: BranchesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
      ],
    });
    service = TestBed.inject(BranchesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists branches within an organization', () => {
    service.list(42, { page: 1, size: 10 }).subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === 'http://localhost:8080/api/v1/organizations/42/branches',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('1');
    request.flush({
      content: [],
      page: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
    });
  });

  it('gets a branch using both organizationId and branchId', () => {
    service.get(42, 7).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42/branches/7');
    expect(request.request.method).toBe('GET');
    request.flush(BRANCH_FIXTURE);
  });

  it('creates a branch within an organization', () => {
    const body = branchRequest();
    service.create(42, body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42/branches');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(BRANCH_FIXTURE);
  });

  it('updates a branch using the organization-scoped URL', () => {
    const body = branchRequest();
    service.update(42, 7, body).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations/42/branches/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush(BRANCH_FIXTURE);
  });
});

function branchRequest(): CreateBranchRequest {
  const {
    id: _id,
    organizationId: _organizationId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...request
  } = BRANCH_FIXTURE;
  return request;
}
