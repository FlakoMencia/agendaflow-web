import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { PageResponse } from '../../../../core/http/page-response.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { CatalogService } from '../../models/service-catalog.model';
import { ServicesApiService } from '../../services/services-api.service';
import { ServiceListPageComponent } from './service-list-page.component';

describe('ServiceListPageComponent', () => {
  let api: ServicesApiStub;
  let auth: AuthSessionStub;

  beforeEach(() => {
    api = new ServicesApiStub();
    auth = new AuthSessionStub();
    TestBed.configureTestingModule({
      imports: [ServiceListPageComponent],
      providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: ServicesApiService, useValue: api }, { provide: AuthSessionService, useValue: auth }],
    });
  });

  it('shows loading and then an empty state', async () => {
    api.responses = [NEVER];
    const loadingFixture = TestBed.createComponent(ServiceListPageComponent);
    loadingFixture.detectChanges();
    expect(loadingFixture.nativeElement.textContent).toContain('Loading services');
    loadingFixture.destroy();

    api.responses = [of(page([]))]; api.calls = 0;
    const emptyFixture = TestBed.createComponent(ServiceListPageComponent);
    emptyFixture.detectChanges(); await emptyFixture.whenStable(); emptyFixture.detectChanges();
    expect(emptyFixture.nativeElement.textContent).toContain('No services yet');
  });

  it('renders a service returned by the API', async () => {
    api.responses = [of(page([SERVICE]))];
    const fixture = TestBed.createComponent(ServiceListPageComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Initial consultation');
  });

  it('shows an error and retries', async () => {
    api.responses = [throwError(() => new HttpErrorResponse({ status: 0 })), of(page([SERVICE]))];
    const fixture = TestBed.createComponent(ServiceListPageComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const retry = Array.from(fixture.nativeElement.querySelectorAll('button')).find((element) => (element as HTMLButtonElement).textContent?.includes('Retry')) as HTMLButtonElement;
    retry.click(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(api.calls).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Initial consultation');
  });

  it('hides management actions without SERVICES_MANAGE', async () => {
    auth.setAuthorization([], ['SERVICES_VIEW']);
    api.responses = [of(page([SERVICE]))];
    const fixture = TestBed.createComponent(ServiceListPageComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('New service');
    expect(text).not.toContain('Edit');
    expect(text).toContain('View');
  });

  it('renders a safe permission error for a 403 response', async () => {
    api.responses = [throwError(() => new HttpErrorResponse({ status: 403 }))];
    const fixture = TestBed.createComponent(ServiceListPageComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('do not have permission');
  });
});

class ServicesApiStub {
  responses: Observable<PageResponse<CatalogService>>[] = [];
  calls = 0;
  list(): Observable<PageResponse<CatalogService>> { return this.responses[this.calls++] ?? NEVER; }
}

const SERVICE: CatalogService = { id: 9, organizationId: 42, categoryId: null, name: 'Initial consultation', description: null, durationMinutes: 30, preparationMinutes: 0, cleanupMinutes: 0, price: 50, currencyCode: 'USD', requiresApproval: false, allowsOnlineBooking: true, active: true, colorCode: null, createdAt: '2026-08-08T00:00:00Z', updatedAt: '2026-08-08T00:00:00Z' };
function page(content: readonly CatalogService[]): PageResponse<CatalogService> { return { content, page: 0, size: 20, totalElements: content.length, totalPages: content.length ? 1 : 0, first: true, last: true }; }
