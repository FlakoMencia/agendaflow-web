import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Specialist, SpecialistRequest } from '../../models/specialist.model';
import { SpecialistsApiService } from '../../services/specialists-api.service';

@Component({ selector: 'app-specialist-form-page', imports: [ButtonModule, InputTextModule, MessageModule, PageHeaderComponent, ReactiveFormsModule, RouterLink], templateUrl: './specialist-form-page.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SpecialistFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly api = inject(SpecialistsApiService); private readonly auth = inject(AuthSessionService); private readonly destroyRef = inject(DestroyRef);
  readonly specialistId = Number(this.route.snapshot.paramMap.get('specialistId')); readonly editing = Number.isSafeInteger(this.specialistId) && this.specialistId > 0;
  readonly loading = signal(this.editing); readonly loaded = signal(!this.editing); readonly saving = signal(false); readonly error = signal<ApiError | null>(null);
  readonly form = new FormGroup({
    userId: new FormControl<number | null>(null, Validators.min(1)), professionalName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(160)] }), specialtyName: optional(150), biography: new FormControl<string | null>(null), licenseNumber: optional(80), photoUrl: optional(500), phone: optional(30), email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(254)]), simultaneousCapacity: new FormControl<number | null>(1, Validators.min(1)), active: new FormControl(true, { nonNullable: true }),
  });
  ngOnInit(): void { if (this.editing) this.load(); }
  submit(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const organizationId = this.auth.activeOrganization()?.id; if (!organizationId) return;
    const request = this.toRequest(); this.saving.set(true); this.error.set(null);
    const operation = this.editing ? this.api.update(organizationId, this.specialistId, request) : this.api.create(organizationId, request);
    operation.pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (specialist) => void this.router.navigate(['/specialists', specialist.id], { queryParams: { saved: this.editing ? 'updated' : 'created' } }), error: (error: unknown) => this.error.set(mapApiError(error)) });
  }
  fieldError(name: string, label: string): string | null { const control = this.form.get(name); return control ? formErrorMessage(control, label, this.error()?.fieldErrors?.[name]) : null; }
  private load(): void { const organizationId = this.auth.activeOrganization()?.id; if (!organizationId) return; this.api.get(organizationId, this.specialistId).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (specialist) => { this.patch(specialist); this.loaded.set(true); }, error: (error: unknown) => this.error.set(mapApiError(error)) }); }
  private patch(item: Specialist): void { this.form.patchValue(item); }
  private toRequest(): SpecialistRequest { const value = this.form.getRawValue(); return { userId: value.userId, professionalName: value.professionalName.trim(), specialtyName: nullable(value.specialtyName), biography: nullable(value.biography), licenseNumber: nullable(value.licenseNumber), photoUrl: nullable(value.photoUrl), phone: nullable(value.phone), email: nullable(value.email), simultaneousCapacity: value.simultaneousCapacity, active: value.active }; }
}
function optional(max: number): FormControl<string | null> { return new FormControl<string | null>(null, Validators.maxLength(max)); }
function nullable(value: string | null): string | null { return value?.trim() || null; }
