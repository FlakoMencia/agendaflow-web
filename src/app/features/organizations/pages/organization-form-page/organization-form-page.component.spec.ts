import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { providePrimeNG } from 'primeng/config';
import { vi } from 'vitest';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { ORGANIZATION_FIXTURE } from '../../../../testing/api-fixtures';
import { CreateOrganizationRequest, Organization } from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { OrganizationFormPageComponent } from './organization-form-page.component';

describe('OrganizationFormPageComponent', () => {
  let api: OrganizationsFormApiStub;

  beforeEach(() => {
    api = new OrganizationsFormApiStub();
    TestBed.configureTestingModule({
      imports: [OrganizationFormPageComponent],
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: OrganizationsApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
  });

  it('marks the required legal name when an invalid form is submitted', () => {
    const fixture = TestBed.createComponent(OrganizationFormPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(api.createCalls).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Legal name is required');
  });

  it('submits a typed create request and navigates to detail', () => {
    api.createResponse = of(ORGANIZATION_FIXTURE);
    const fixture = TestBed.createComponent(OrganizationFormPageComponent);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    fixture.componentInstance.form.controls.legalName.setValue('  Created Organization  ');

    fixture.componentInstance.submit();

    expect(api.lastCreateRequest?.legalName).toBe('Created Organization');
    expect(navigate).toHaveBeenCalledWith(['/organizations', 42], {
      queryParams: { saved: 'created' },
    });
  });

  it('blocks duplicate submits while saving', () => {
    const pending = new Subject<Organization>();
    api.createResponse = pending;
    const fixture = TestBed.createComponent(OrganizationFormPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.controls.legalName.setValue('Organization');

    fixture.componentInstance.submit();
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(api.createCalls).toBe(1);
    expect(fixture.componentInstance.saving()).toBe(true);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    pending.complete();
  });
});

class OrganizationsFormApiStub {
  createResponse: Observable<Organization> = of(ORGANIZATION_FIXTURE);
  createCalls = 0;
  lastCreateRequest: CreateOrganizationRequest | null = null;

  create(request: CreateOrganizationRequest): Observable<Organization> {
    this.createCalls += 1;
    this.lastCreateRequest = request;
    return this.createResponse;
  }

  get(): Observable<Organization> {
    return of(ORGANIZATION_FIXTURE);
  }

  update(): Observable<Organization> {
    return of(ORGANIZATION_FIXTURE);
  }
}
