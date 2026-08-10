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
import { CatalogService } from '../../../services/models/service-catalog.model';
import { ServicesApiService } from '../../../services/services/services-api.service';
import { Specialist, SpecialistBranchAssignment, SpecialistServiceAssignment, SpecialistServiceAssignmentRequest } from '../../models/specialist.model';
import { SpecialistsApiService } from '../../services/specialists-api.service';
import { SpecialistDetailPageComponent } from './specialist-detail-page.component';

describe('SpecialistDetailPageComponent', () => {
  it('saves a specialist service assignment only after user action', async () => {
    const api = new SpecialistAssignmentsApiStub();
    TestBed.configureTestingModule({ imports: [SpecialistDetailPageComponent], providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ specialistId: '8' }), queryParamMap: convertToParamMap({}) } } }, { provide: AuthSessionService, useValue: new AuthSessionStub() }, { provide: SpecialistsApiService, useValue: api }, { provide: BranchesApiService, useValue: { list: () => of(page([BRANCH])) } }, { provide: ServicesApiService, useValue: { list: () => of(page([SERVICE])) } }] });
    const fixture = TestBed.createComponent(SpecialistDetailPageComponent);
    fixture.detectChanges(); await fixture.whenStable();
    expect(api.serviceAssignmentCalls).toBe(0);
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = true;
    fixture.componentInstance.onServiceActive(fixture.componentInstance.services()[0], { target: checkbox } as unknown as Event);
    fixture.componentInstance.saveService(fixture.componentInstance.services()[0]);
    expect(api.serviceAssignmentCalls).toBe(1);
    expect(api.request?.active).toBe(true);
    expect(fixture.componentInstance.services()[0].active).toBe(true);
  });
});

class SpecialistAssignmentsApiStub {
  serviceAssignmentCalls = 0; request: SpecialistServiceAssignmentRequest | null = null;
  get(): Observable<Specialist> { return of(SPECIALIST); }
  listBranches(): Observable<readonly SpecialistBranchAssignment[]> { return of([]); }
  listServices(): Observable<readonly SpecialistServiceAssignment[]> { return of([]); }
  assignService(_organizationId: number, specialistId: number, serviceId: number, request: SpecialistServiceAssignmentRequest): Observable<SpecialistServiceAssignment> { this.serviceAssignmentCalls += 1; this.request = request; return of({ specialistId, serviceId, serviceName: SERVICE.name, customDurationMinutes: request.customDurationMinutes, customPrice: request.customPrice, active: request.active ?? false, createdAt: '' }); }
}
const SPECIALIST: Specialist = { id: 8, organizationId: 42, userId: null, professionalName: 'Ada', specialtyName: null, biography: null, licenseNumber: null, photoUrl: null, phone: null, email: null, simultaneousCapacity: 1, active: true, createdAt: '', updatedAt: '' };
const SERVICE: CatalogService = { id: 9, organizationId: 42, categoryId: null, name: 'Consultation', description: null, durationMinutes: 30, preparationMinutes: 0, cleanupMinutes: 0, price: null, currencyCode: 'USD', requiresApproval: false, allowsOnlineBooking: true, active: true, colorCode: null, createdAt: '', updatedAt: '' };
const BRANCH: Branch = { id: 7, organizationId: 42, name: 'Main', code: null, email: null, phone: null, addressLine1: null, addressLine2: null, city: null, stateCode: null, postalCode: null, countryCode: 'US', timezone: null, latitude: null, longitude: null, active: true, createdAt: '', updatedAt: '' };
function page<T>(content: readonly T[]): PageResponse<T> { return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1, first: true, last: true }; }
