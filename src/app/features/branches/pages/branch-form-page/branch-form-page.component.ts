import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, Observable, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { formErrorMessage } from '../../../../core/http/form-validation';
import { Organization } from '../../../organizations/models/organization.model';
import { OrganizationsApiService } from '../../../organizations/services/organizations-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Branch, CreateBranchRequest } from '../../models/branch.model';
import { BranchesApiService } from '../../services/branches-api.service';

@Component({
  selector: 'app-branch-form-page',
  imports: [
    ButtonModule,
    InputTextModule,
    MessageModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './branch-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly organizationsApi = inject(OrganizationsApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly organizationId = Number(this.route.snapshot.paramMap.get('organizationId'));
  readonly branchId = Number(this.route.snapshot.paramMap.get('branchId'));
  readonly editing = Number.isSafeInteger(this.branchId) && this.branchId > 0;
  readonly organization = signal<Organization | null>(null);
  readonly loading = signal(true);
  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ApiError | null>(null);

  readonly form = new FormGroup({
    name: requiredText(150),
    code: optionalText(40),
    email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(254)]),
    phone: optionalText(30),
    addressLine1: optionalText(150),
    addressLine2: optionalText(150),
    city: optionalText(100),
    stateCode: optionalText(10),
    postalCode: optionalText(15),
    countryCode: new FormControl('US', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern(/^[A-Za-z]{2}$/),
      ],
    }),
    timezone: optionalText(60),
    latitude: coordinateControl(-90, 90),
    longitude: coordinateControl(-180, 180),
    active: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadContext();
  }

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    const request = this.toRequest();
    const operation = this.editing
      ? this.branchesApi.update(this.organizationId, this.branchId, request)
      : this.branchesApi.create(this.organizationId, request);

    operation
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/organizations', this.organizationId, 'branches'], {
            queryParams: { saved: this.editing ? 'updated' : 'created' },
          });
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }

  fieldError(controlName: string, label: string): string | null {
    const control = this.form.get(controlName);
    if (!control) return null;
    return formErrorMessage(control, label, this.error()?.fieldErrors?.[controlName]);
  }

  private loadContext(): void {
    if (!Number.isSafeInteger(this.organizationId) || this.organizationId <= 0) {
      this.loading.set(false);
      this.error.set({
        timestamp: null,
        status: 400,
        code: 'INVALID_ORGANIZATION_ID',
        message: 'The organization identifier is invalid.',
        path: null,
      });
      return;
    }

    const request: Observable<{ organization: Organization; branch: Branch | null }> = this.editing
      ? forkJoin({
          organization: this.organizationsApi.get(this.organizationId),
          branch: this.branchesApi.get(this.organizationId, this.branchId),
        })
      : forkJoin({
          organization: this.organizationsApi.get(this.organizationId),
          branch: of<Branch | null>(null),
        });

    request
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ organization, branch }) => {
          this.organization.set(organization);
          if (branch) this.patchForm(branch);
          this.loaded.set(true);
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }

  private patchForm(branch: Branch): void {
    this.form.patchValue({
      name: branch.name,
      code: branch.code,
      email: branch.email,
      phone: branch.phone,
      addressLine1: branch.addressLine1,
      addressLine2: branch.addressLine2,
      city: branch.city,
      stateCode: branch.stateCode,
      postalCode: branch.postalCode,
      countryCode: branch.countryCode,
      timezone: branch.timezone,
      latitude: branch.latitude,
      longitude: branch.longitude,
      active: branch.active,
    });
  }

  private toRequest(): CreateBranchRequest {
    const value = this.form.getRawValue();
    return {
      name: value.name.trim(),
      code: nullableText(value.code),
      email: nullableText(value.email),
      phone: nullableText(value.phone),
      addressLine1: nullableText(value.addressLine1),
      addressLine2: nullableText(value.addressLine2),
      city: nullableText(value.city),
      stateCode: nullableText(value.stateCode),
      postalCode: nullableText(value.postalCode),
      countryCode: value.countryCode.trim().toUpperCase(),
      timezone: nullableText(value.timezone),
      latitude: value.latitude,
      longitude: value.longitude,
      active: value.active,
    };
  }
}

function requiredText(maxLength: number): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(maxLength)],
  });
}

function optionalText(maxLength: number): FormControl<string | null> {
  return new FormControl<string | null>(null, Validators.maxLength(maxLength));
}

function coordinateControl(min: number, max: number): FormControl<number | null> {
  return new FormControl<number | null>(null, [
    Validators.min(min),
    Validators.max(max),
    Validators.pattern(/^-?\d{1,3}(\.\d{1,6})?$/),
  ]);
}

function nullableText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
