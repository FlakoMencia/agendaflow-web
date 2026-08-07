import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { ORGANIZATION_FIXTURE } from '../../../../testing/api-fixtures';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { OrganizationDetailPageComponent } from './organization-detail-page.component';

describe('OrganizationDetailPageComponent', () => {
  it('provides navigation to the organization branches', async () => {
    TestBed.configureTestingModule({
      imports: [OrganizationDetailPageComponent],
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: OrganizationsApiService, useValue: { get: () => of(ORGANIZATION_FIXTURE) } },
        { provide: AuthSessionService, useValue: new AuthSessionStub() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ organizationId: '42' }),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(OrganizationDetailPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const branchLink = fixture.nativeElement.querySelector('a[href="/organizations/42/branches"]');
    expect(branchLink).toBeTruthy();
  });
});
