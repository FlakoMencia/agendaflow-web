import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { PageResponse } from '../../../../core/http/page-response.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { BranchServiceAssignment, CatalogService } from '../../models/service-catalog.model';
import { ServicesApiService } from '../../services/services-api.service';
import { ServiceDetailPageComponent } from './service-detail-page.component';

describe('ServiceDetailPageComponent', () => {
  it('activates the service at an organization branch after API confirmation', async () => {
    const api = new ServiceAssignmentApiStub();
    TestBed.configureTestingModule({ imports: [ServiceDetailPageComponent], providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ serviceId: '9' }), queryParamMap: convertToParamMap({}) } } }, { provide: AuthSessionService, useValue: new AuthSessionStub() }, { provide: ServicesApiService, useValue: api }, { provide: BranchesApiService, useValue: { list: () => of(page([BRANCH])) } }] });
    const fixture = TestBed.createComponent(ServiceDetailPageComponent);
    fixture.detectChanges(); await fixture.whenStable();
    const item = fixture.componentInstance.branches()[0];
    expect(item.active).toBe(false);
    fixture.componentInstance.toggleBranch(item);
    expect(api.assignmentCalls).toBe(1);
    expect(fixture.componentInstance.branches()[0].active).toBe(true);
  });
});

class ServiceAssignmentApiStub {
  assignmentCalls = 0;
  get(): Observable<CatalogService> { return of(SERVICE); }
  listBranchServices(): Observable<readonly BranchServiceAssignment[]> { return of([]); }
  assignBranch(_organizationId: number, branchId: number, serviceId: number): Observable<BranchServiceAssignment> { this.assignmentCalls += 1; return of({ branchId, serviceId, serviceName: SERVICE.name, active: true, createdAt: '' }); }
}
const SERVICE: CatalogService = { id: 9, organizationId: 42, categoryId: null, name: 'Consultation', description: null, durationMinutes: 30, preparationMinutes: 0, cleanupMinutes: 0, price: null, currencyCode: 'USD', requiresApproval: false, allowsOnlineBooking: true, active: true, colorCode: null, createdAt: '', updatedAt: '' };
const BRANCH: Branch = { id: 7, organizationId: 42, name: 'Main', code: null, email: null, phone: null, addressLine1: null, addressLine2: null, city: null, stateCode: null, postalCode: null, countryCode: 'US', timezone: null, latitude: null, longitude: null, active: true, createdAt: '', updatedAt: '' };
function page<T>(content: readonly T[]): PageResponse<T> { return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1, first: true, last: true }; }
