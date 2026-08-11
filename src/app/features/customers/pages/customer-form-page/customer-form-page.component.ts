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

import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ApiError } from '../../../../core/http/api-error.model';
import { formErrorMessage } from '../../../../core/http/form-validation';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Customer, CustomerRequest, PreferredContactMethod } from '../../models/customer.model';
import { CustomersApiService } from '../../services/customers-api.service';

@Component({
  selector: 'app-customer-form-page',
  imports: [
    ButtonModule,
    InputTextModule,
    MessageModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './customer-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CustomersApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly customerId = Number(this.route.snapshot.paramMap.get('customerId'));
  readonly editing = Number.isSafeInteger(this.customerId) && this.customerId > 0;
  readonly loading = signal(this.editing);
  readonly saving = signal(false);
  readonly loaded = signal(!this.editing);
  readonly error = signal<ApiError | null>(null);
  readonly form = new FormGroup({
    customerNumber: optional(40),
    firstName: required(80),
    middleName: optional(80),
    lastName: required(80),
    secondLastName: optional(80),
    email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(254)]),
    phone: optional(30),
    alternatePhone: optional(30),
    dateOfBirth: new FormControl<string | null>(null),
    preferredLanguage: optional(10),
    preferredContactMethod: new FormControl<PreferredContactMethod | null>(null),
    addressLine1: optional(150),
    addressLine2: optional(150),
    city: optional(100),
    stateCode: optional(10),
    postalCode: optional(15),
    countryCode: optional(2),
    emergencyContactName: optional(160),
    emergencyContactPhone: optional(30),
    emergencyContactRelationship: optional(80),
    emailConsent: new FormControl(false, { nonNullable: true }),
    smsConsent: new FormControl(false, { nonNullable: true }),
    marketingConsent: new FormControl(false, { nonNullable: true }),
    termsAcceptedAt: new FormControl<string | null>(null),
    privacyPolicyAcceptedAt: new FormControl<string | null>(null),
    internalNotes: optional(10000),
    active: new FormControl(true, { nonNullable: true }),
  });
  ngOnInit(): void {
    if (this.editing) this.load();
  }
  fieldError(name: string, label: string): string | null {
    const control = this.form.get(name);
    return control ? formErrorMessage(control, label, this.error()?.fieldErrors?.[name]) : null;
  }
  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) return;
    this.saving.set(true);
    this.error.set(null);
    const operation = this.editing
      ? this.api.update(organizationId, this.customerId, this.request())
      : this.api.create(organizationId, this.request());
    operation
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (customer) =>
          void this.router.navigate(['/customers', customer.id], {
            queryParams: { saved: this.editing ? 'updated' : 'created' },
          }),
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }
  private load(): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) return;
    this.api
      .get(organizationId, this.customerId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (customer) => {
          this.patch(customer);
          this.loaded.set(true);
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }
  private patch(c: Customer): void {
    this.form.patchValue({
      ...c,
      termsAcceptedAt: localDateTime(c.termsAcceptedAt),
      privacyPolicyAcceptedAt: localDateTime(c.privacyPolicyAcceptedAt),
    });
  }
  private request(): CustomerRequest {
    const v = this.form.getRawValue();
    return {
      ...v,
      customerNumber: clean(v.customerNumber),
      firstName: v.firstName.trim(),
      middleName: clean(v.middleName),
      lastName: v.lastName.trim(),
      secondLastName: clean(v.secondLastName),
      email: clean(v.email),
      phone: clean(v.phone),
      alternatePhone: clean(v.alternatePhone),
      preferredLanguage: clean(v.preferredLanguage),
      addressLine1: clean(v.addressLine1),
      addressLine2: clean(v.addressLine2),
      city: clean(v.city),
      stateCode: clean(v.stateCode),
      postalCode: clean(v.postalCode),
      countryCode: clean(v.countryCode)?.toUpperCase() ?? null,
      emergencyContactName: clean(v.emergencyContactName),
      emergencyContactPhone: clean(v.emergencyContactPhone),
      emergencyContactRelationship: clean(v.emergencyContactRelationship),
      termsAcceptedAt: isoDateTime(v.termsAcceptedAt),
      privacyPolicyAcceptedAt: isoDateTime(v.privacyPolicyAcceptedAt),
      internalNotes: clean(v.internalNotes),
    };
  }
}
function required(max: number): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(max)],
  });
}
function optional(max: number): FormControl<string | null> {
  return new FormControl<string | null>(null, Validators.maxLength(max));
}
function clean(value: string | null): string | null {
  return value?.trim() || null;
}

function isoDateTime(value: string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

function localDateTime(value: string | null): string | null {
  return value?.slice(0, 16) ?? null;
}
