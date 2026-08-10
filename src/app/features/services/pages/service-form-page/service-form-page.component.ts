import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { formErrorMessage } from '../../../../core/http/form-validation';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CatalogService, CatalogServiceRequest, ServiceCategory } from '../../models/service-catalog.model';
import { ServiceCategoriesApiService } from '../../services/service-categories-api.service';
import { ServicesApiService } from '../../services/services-api.service';

@Component({
  selector: 'app-service-form-page',
  imports: [ButtonModule, InputTextModule, MessageModule, PageHeaderComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './service-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ServicesApiService);
  private readonly categoriesApi = inject(ServiceCategoriesApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly serviceId = Number(this.route.snapshot.paramMap.get('serviceId'));
  readonly editing = Number.isSafeInteger(this.serviceId) && this.serviceId > 0;
  readonly categories = signal<readonly ServiceCategory[]>([]);
  readonly loading = signal(true);
  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ApiError | null>(null);
  readonly form = new FormGroup({
    categoryId: new FormControl<number | null>(null),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    description: new FormControl<string | null>(null),
    durationMinutes: new FormControl(30, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    preparationMinutes: new FormControl<number | null>(0, Validators.min(0)),
    cleanupMinutes: new FormControl<number | null>(0, Validators.min(0)),
    price: new FormControl<number | null>(null, Validators.min(0)),
    currencyCode: new FormControl('USD', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)] }),
    colorCode: new FormControl<string | null>(null, Validators.maxLength(20)),
    requiresApproval: new FormControl(false, { nonNullable: true }),
    allowsOnlineBooking: new FormControl(true, { nonNullable: true }),
    active: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void { this.load(); }
  submit(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) return;
    this.saving.set(true); this.error.set(null);
    const request = this.toRequest();
    const operation = this.editing ? this.api.update(organizationId, this.serviceId, request) : this.api.create(organizationId, request);
    operation.pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (service) => void this.router.navigate(['/services', service.id], { queryParams: { saved: this.editing ? 'updated' : 'created' } }),
      error: (error: unknown) => this.error.set(mapApiError(error)),
    });
  }
  fieldError(name: string, label: string): string | null {
    const control = this.form.get(name);
    return control ? formErrorMessage(control, label, this.error()?.fieldErrors?.[name]) : null;
  }
  private load(): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) { this.loading.set(false); this.error.set(activeOrganizationError()); return; }
    const serviceRequest = this.editing ? this.api.get(organizationId, this.serviceId) : of<CatalogService | null>(null);
    forkJoin({ categories: this.categoriesApi.list(organizationId), service: serviceRequest })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: ({ categories, service }) => { this.categories.set(categories); if (service) this.patch(service); this.loaded.set(true); }, error: (error: unknown) => this.error.set(mapApiError(error)) });
  }
  private patch(service: CatalogService): void { this.form.patchValue(service); }
  private toRequest(): CatalogServiceRequest {
    const value = this.form.getRawValue();
    return { categoryId: value.categoryId, name: value.name.trim(), description: nullable(value.description), durationMinutes: value.durationMinutes, preparationMinutes: value.preparationMinutes, cleanupMinutes: value.cleanupMinutes, price: value.price, currencyCode: value.currencyCode.trim().toUpperCase(), requiresApproval: value.requiresApproval, allowsOnlineBooking: value.allowsOnlineBooking, active: value.active, colorCode: nullable(value.colorCode) };
  }
}
function nullable(value: string | null): string | null { return value?.trim() || null; }
function activeOrganizationError(): ApiError { return { timestamp: null, status: 400, code: 'ACTIVE_ORGANIZATION_REQUIRED', message: 'The active organization is unavailable. Sign in again.', path: null }; }
