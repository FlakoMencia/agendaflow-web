import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CatalogService } from '../../models/service-catalog.model';
import { ServicesApiService } from '../../services/services-api.service';

@Component({
  selector: 'app-service-list-page',
  imports: [ButtonModule, EmptyStateComponent, MessageModule, PageHeaderComponent, PaginatorModule, RouterLink, StatusBadgeComponent, TableModule],
  templateUrl: './service-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceListPageComponent implements OnInit {
  private readonly api = inject(ServicesApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<CatalogService[]>([]);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalElements = signal(0);
  readonly canManage = () => this.auth.hasPermission('SERVICES_MANAGE');

  ngOnInit(): void { this.load(); }
  retry(): void { this.load(this.page()); }
  onPageChange(event: PaginatorState): void {
    this.size.set(event.rows ?? this.size());
    this.load(event.page ?? 0);
  }

  private load(page = 0): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) {
      this.loading.set(false);
      this.error.set(sessionOrganizationError());
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.list(organizationId, { page, size: this.size(), sort: 'name,asc' })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.services.set([...result.content]);
          this.page.set(result.page);
          this.size.set(result.size);
          this.totalElements.set(result.totalElements);
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }
}

function sessionOrganizationError(): ApiError {
  return { timestamp: null, status: 400, code: 'ACTIVE_ORGANIZATION_REQUIRED', message: 'The active organization is unavailable. Sign in again.', path: null };
}
