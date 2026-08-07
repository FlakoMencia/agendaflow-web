import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { BRANCH_FIXTURE, ORGANIZATION_FIXTURE } from '../../../../testing/api-fixtures';
import { OrganizationsApiService } from '../../../organizations/services/organizations-api.service';
import { BranchesApiService } from '../../services/branches-api.service';
import { BranchFormPageComponent } from './branch-form-page.component';

describe('BranchFormPageComponent', () => {
  it('keeps organizationId route-scoped and outside the editable form', async () => {
    TestBed.configureTestingModule({
      imports: [BranchFormPageComponent],
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: OrganizationsApiService, useValue: { get: () => of(ORGANIZATION_FIXTURE) } },
        { provide: AuthSessionService, useValue: new AuthSessionStub() },
        {
          provide: BranchesApiService,
          useValue: {
            get: () => of(BRANCH_FIXTURE),
            create: () => of(BRANCH_FIXTURE),
            update: () => of(BRANCH_FIXTURE),
          },
        },
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
    const fixture = TestBed.createComponent(BranchFormPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.organizationId).toBe(42);
    expect(fixture.componentInstance.form.contains('organizationId')).toBe(false);
    expect(fixture.nativeElement.querySelector('[formcontrolname="organizationId"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(ORGANIZATION_FIXTURE.legalName);
  });
});
