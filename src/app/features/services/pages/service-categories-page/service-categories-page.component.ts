import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ServiceCategory, ServiceCategoryRequest } from '../../models/service-catalog.model';
import { ServiceCategoriesApiService } from '../../services/service-categories-api.service';

@Component({
  selector: 'app-service-categories-page',
  imports: [ButtonModule, EmptyStateComponent, InputTextModule, MessageModule, PageHeaderComponent, ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './service-categories-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCategoriesPageComponent implements OnInit {
  private readonly api = inject(ServiceCategoriesApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly categories = signal<readonly ServiceCategory[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editorOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly error = signal<ApiError | null>(null);
  readonly canManage = () => this.auth.hasPermission('SERVICES_MANAGE');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl<string | null>(null),
    active: new FormControl(true, { nonNullable: true }),
  });
  ngOnInit(): void { this.load(); }
  openCreate(): void { this.editingId.set(null); this.form.reset({ name: '', description: null, active: true }); this.error.set(null); this.editorOpen.set(true); }
  openEdit(category: ServiceCategory): void { this.editingId.set(category.id); this.form.reset({ name: category.name, description: category.description, active: category.active }); this.error.set(null); this.editorOpen.set(true); }
  cancel(): void { this.editorOpen.set(false); this.error.set(null); }
  save(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) return;
    const value = this.form.getRawValue();
    const request: ServiceCategoryRequest = { name: value.name.trim(), description: value.description?.trim() || null, active: value.active };
    const editingId = this.editingId();
    const operation = editingId ? this.api.update(organizationId, editingId, request) : this.api.create(organizationId, request);
    this.saving.set(true); this.error.set(null);
    operation.pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.editorOpen.set(false); this.load(); }, error: (error: unknown) => this.error.set(mapApiError(error)) });
  }
  retry(): void { this.load(); }
  private load(): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) { this.loading.set(false); return; }
    this.loading.set(true); this.error.set(null);
    this.api.list(organizationId).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (categories) => this.categories.set(categories), error: (error: unknown) => this.error.set(mapApiError(error)) });
  }
}
