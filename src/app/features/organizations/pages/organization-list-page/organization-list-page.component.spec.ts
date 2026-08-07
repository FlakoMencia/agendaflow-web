import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { PageResponse } from '../../../../core/http/page-response.model';
import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { ORGANIZATION_FIXTURE, pageResponse } from '../../../../testing/api-fixtures';
import { OrganizationSummary } from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { OrganizationListPageComponent } from './organization-list-page.component';

describe('OrganizationListPageComponent', () => {
  let api: OrganizationsApiStub;
  let auth: AuthSessionStub;

  beforeEach(() => {
    api = new OrganizationsApiStub();
    auth = new AuthSessionStub();
    TestBed.configureTestingModule({
      imports: [OrganizationListPageComponent],
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: OrganizationsApiService, useValue: api },
        { provide: AuthSessionService, useValue: auth },
      ],
    });
  });

  it('renders a loading state while the request is pending', () => {
    api.responses = [NEVER];
    const fixture = TestBed.createComponent(OrganizationListPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading organizations');
  });

  it('renders the empty state for an empty page', async () => {
    api.responses = [of(pageResponse([]))];
    const fixture = TestBed.createComponent(OrganizationListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No organizations yet');
  });

  it('renders organizations returned by the backend', async () => {
    api.responses = [of(pageResponse([ORGANIZATION_FIXTURE]))];
    const fixture = TestBed.createComponent(OrganizationListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('AgendaFlow Test Organization');
  });

  it('shows an error and retries the request', async () => {
    api.responses = [
      throwError(() => new HttpErrorResponse({ status: 0 })),
      of(pageResponse([ORGANIZATION_FIXTURE])),
    ];
    const fixture = TestBed.createComponent(OrganizationListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('API is unavailable');
    const retry = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Retry'),
    ) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.calls).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('AgendaFlow Test Organization');
  });

  it('shows only the active organization and hides platform-only actions for a normal user', async () => {
    auth.setAuthorization([], ['ORGANIZATION_VIEW']);
    api.detailResponse = of(ORGANIZATION_FIXTURE);
    const fixture = TestBed.createComponent(OrganizationListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(api.calls).toBe(0);
    expect(api.getCalls).toBe(1);
    expect(text).toContain('AgendaFlow Test Organization');
    expect(text).not.toContain('New organization');
    expect(text).not.toContain('Edit');
    expect(text).not.toContain('Branches');
    expect(fixture.nativeElement.querySelector('p-paginator')).toBeFalsy();
  });
});

class OrganizationsApiStub {
  responses: Observable<PageResponse<OrganizationSummary>>[] = [];
  detailResponse: Observable<OrganizationSummary> = of(ORGANIZATION_FIXTURE);
  calls = 0;
  getCalls = 0;

  list(): Observable<PageResponse<OrganizationSummary>> {
    return this.responses[this.calls++] ?? NEVER;
  }

  get(): Observable<OrganizationSummary> {
    this.getCalls += 1;
    return this.detailResponse;
  }
}
