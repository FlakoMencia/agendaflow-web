import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { CatalogService, CatalogServiceRequest, ServiceCategory } from '../../models/service-catalog.model';
import { ServiceCategoriesApiService } from '../../services/service-categories-api.service';
import { ServicesApiService } from '../../services/services-api.service';
import { ServiceFormPageComponent } from './service-form-page.component';

describe('ServiceFormPageComponent', () => {
  let api: ServicesFormApiStub;

  beforeEach(() => {
    api = new ServicesFormApiStub();
    TestBed.configureTestingModule({ imports: [ServiceFormPageComponent], providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: ServicesApiService, useValue: api }, { provide: ServiceCategoriesApiService, useValue: { list: () => of<readonly ServiceCategory[]>([]) } }, { provide: AuthSessionService, useValue: new AuthSessionStub() }] });
  });

  it('does not send an invalid form', async () => {
    const fixture = TestBed.createComponent(ServiceFormPageComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    fixture.componentInstance.form.controls.name.setValue('');
    fixture.componentInstance.submit();
    expect(api.createCalls).toBe(0);
    expect(fixture.componentInstance.form.controls.name.touched).toBe(true);
  });

  it('sends a valid create request for the active organization', async () => {
    const fixture = TestBed.createComponent(ServiceFormPageComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.form.patchValue({ name: 'Consultation', durationMinutes: 45, currencyCode: 'usd' });
    fixture.componentInstance.submit();
    expect(api.createCalls).toBe(1);
    expect(api.lastOrganizationId).toBe(42);
    expect(api.lastRequest?.currencyCode).toBe('USD');
  });
});

class ServicesFormApiStub {
  createCalls = 0; lastOrganizationId: number | null = null; lastRequest: CatalogServiceRequest | null = null;
  create(organizationId: number, request: CatalogServiceRequest): Observable<CatalogService> { this.createCalls += 1; this.lastOrganizationId = organizationId; this.lastRequest = request; return of({ id: 9, organizationId, categoryId: request.categoryId, name: request.name, description: request.description, durationMinutes: request.durationMinutes, preparationMinutes: request.preparationMinutes ?? 0, cleanupMinutes: request.cleanupMinutes ?? 0, price: request.price, currencyCode: request.currencyCode ?? 'USD', requiresApproval: request.requiresApproval ?? false, allowsOnlineBooking: request.allowsOnlineBooking ?? false, active: request.active ?? false, colorCode: request.colorCode, createdAt: '', updatedAt: '' }); }
  update(): Observable<CatalogService> { throw new Error('Unexpected update'); }
  get(): Observable<CatalogService> { throw new Error('Unexpected get'); }
}
