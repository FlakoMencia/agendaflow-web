import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { CatalogService, CatalogServiceRequest, ServiceCategory } from '../../models/service-catalog.model';
import { ServiceCategoriesApiService } from '../../services/service-categories-api.service';
import { ServicesApiService } from '../../services/services-api.service';
import { ServiceFormPageComponent } from './service-form-page.component';

describe('ServiceFormPageComponent edit mode', () => {
  it('loads the existing DTO and sends an update', async () => {
    const api = new ServiceEditApiStub();
    TestBed.configureTestingModule({ imports: [ServiceFormPageComponent], providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ serviceId: '9' }) } } }, { provide: AuthSessionService, useValue: new AuthSessionStub() }, { provide: ServiceCategoriesApiService, useValue: { list: () => of<readonly ServiceCategory[]>([]) } }, { provide: ServicesApiService, useValue: api }] });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ServiceFormPageComponent);
    fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.componentInstance.form.controls.name.value).toBe('Consultation');
    fixture.componentInstance.form.controls.name.setValue('Extended consultation');
    fixture.componentInstance.submit();
    expect(api.updateCalls).toBe(1);
    expect(api.serviceId).toBe(9);
    expect(api.request?.name).toBe('Extended consultation');
  });
});

class ServiceEditApiStub {
  updateCalls = 0; serviceId: number | null = null; request: CatalogServiceRequest | null = null;
  get(): Observable<CatalogService> { return of(SERVICE); }
  update(_organizationId: number, serviceId: number, request: CatalogServiceRequest): Observable<CatalogService> { this.updateCalls += 1; this.serviceId = serviceId; this.request = request; return of({ ...SERVICE, ...request, preparationMinutes: request.preparationMinutes ?? 0, cleanupMinutes: request.cleanupMinutes ?? 0, currencyCode: request.currencyCode ?? 'USD', requiresApproval: request.requiresApproval ?? false, allowsOnlineBooking: request.allowsOnlineBooking ?? false, active: request.active ?? false }); }
  create(): Observable<CatalogService> { throw new Error('Unexpected create'); }
}

const SERVICE: CatalogService = { id: 9, organizationId: 42, categoryId: null, name: 'Consultation', description: null, durationMinutes: 30, preparationMinutes: 0, cleanupMinutes: 0, price: 50, currencyCode: 'USD', requiresApproval: false, allowsOnlineBooking: true, active: true, colorCode: null, createdAt: '', updatedAt: '' };
