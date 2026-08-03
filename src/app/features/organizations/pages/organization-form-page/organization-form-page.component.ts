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
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { formErrorMessage } from '../../../../core/http/form-validation';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  CreateOrganizationRequest,
  Organization,
  OrganizationStatus,
} from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';

@Component({
  selector: 'app-organization-form-page',
  imports: [
    ButtonModule,
    InputTextModule,
    MessageModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './organization-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly organizationsApi = inject(OrganizationsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly organizationId = Number(this.route.snapshot.paramMap.get('organizationId'));
  readonly editing = Number.isSafeInteger(this.organizationId) && this.organizationId > 0;
  readonly loading = signal(this.editing);
  readonly loaded = signal(!this.editing);
  readonly saving = signal(false);
  readonly error = signal<ApiError | null>(null);
  readonly statuses: readonly OrganizationStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];

  readonly form = new FormGroup({
    legalName: requiredText(180),
    tradeName: optionalText(180),
    taxIdentifier: optionalText(50),
    organizationType: optionalText(50),
    email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(254)]),
    phone: optionalText(30),
    website: optionalText(255),
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
    logoUrl: optionalText(500),
    timezone: new FormControl('America/New_York', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    }),
    currencyCode: new FormControl('USD', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(3),
        Validators.pattern(/^[A-Za-z]{3}$/),
      ],
    }),
    languageCode: new FormControl('en-US', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(10)],
    }),
    allowsPublicBooking: new FormControl(true, { nonNullable: true }),
    allowsGuestBooking: new FormControl(true, { nonNullable: true }),
    requiresAppointmentConfirmation: new FormControl(false, { nonNullable: true }),
    minimumBookingNoticeMinutes: nonNegativeNumber(0),
    maximumBookingDaysAhead: nonNegativeNumber(365),
    cancellationNoticeMinutes: nonNegativeNumber(0),
    status: new FormControl<OrganizationStatus>('ACTIVE', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  ngOnInit(): void {
    if (this.editing) this.loadOrganization();
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
      ? this.organizationsApi.update(this.organizationId, request)
      : this.organizationsApi.create(request);

    operation
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (organization) => {
          void this.router.navigate(['/organizations', organization.id], {
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

  private loadOrganization(): void {
    this.organizationsApi
      .get(this.organizationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (organization) => {
          this.patchForm(organization);
          this.loaded.set(true);
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }

  private patchForm(organization: Organization): void {
    this.form.patchValue({
      legalName: organization.legalName,
      tradeName: organization.tradeName,
      taxIdentifier: organization.taxIdentifier,
      organizationType: organization.organizationType,
      email: organization.email,
      phone: organization.phone,
      website: organization.website,
      addressLine1: organization.addressLine1,
      addressLine2: organization.addressLine2,
      city: organization.city,
      stateCode: organization.stateCode,
      postalCode: organization.postalCode,
      countryCode: organization.countryCode,
      logoUrl: organization.logoUrl,
      timezone: organization.timezone,
      currencyCode: organization.currencyCode,
      languageCode: organization.languageCode,
      allowsPublicBooking: organization.allowsPublicBooking,
      allowsGuestBooking: organization.allowsGuestBooking,
      requiresAppointmentConfirmation: organization.requiresAppointmentConfirmation,
      minimumBookingNoticeMinutes: organization.minimumBookingNoticeMinutes,
      maximumBookingDaysAhead: organization.maximumBookingDaysAhead,
      cancellationNoticeMinutes: organization.cancellationNoticeMinutes,
      status: organization.status,
    });
  }

  private toRequest(): CreateOrganizationRequest {
    const value = this.form.getRawValue();
    return {
      legalName: value.legalName.trim(),
      tradeName: nullableText(value.tradeName),
      taxIdentifier: nullableText(value.taxIdentifier),
      organizationType: nullableText(value.organizationType),
      email: nullableText(value.email),
      phone: nullableText(value.phone),
      website: nullableText(value.website),
      addressLine1: nullableText(value.addressLine1),
      addressLine2: nullableText(value.addressLine2),
      city: nullableText(value.city),
      stateCode: nullableText(value.stateCode),
      postalCode: nullableText(value.postalCode),
      countryCode: value.countryCode.trim().toUpperCase(),
      logoUrl: nullableText(value.logoUrl),
      timezone: value.timezone.trim(),
      currencyCode: value.currencyCode.trim().toUpperCase(),
      languageCode: value.languageCode.trim(),
      allowsPublicBooking: value.allowsPublicBooking,
      allowsGuestBooking: value.allowsGuestBooking,
      requiresAppointmentConfirmation: value.requiresAppointmentConfirmation,
      minimumBookingNoticeMinutes: value.minimumBookingNoticeMinutes,
      maximumBookingDaysAhead: value.maximumBookingDaysAhead,
      cancellationNoticeMinutes: value.cancellationNoticeMinutes,
      status: value.status,
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

function nonNegativeNumber(initialValue: number): FormControl<number> {
  return new FormControl(initialValue, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0)],
  });
}

function nullableText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
