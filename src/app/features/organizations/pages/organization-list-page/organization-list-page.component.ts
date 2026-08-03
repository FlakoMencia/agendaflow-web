import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  StatusBadgeComponent,
  StatusBadgeState,
} from '../../../../shared/components/status-badge/status-badge.component';
import { OrganizationStatus, OrganizationSummary } from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';

@Component({
  selector: 'app-organization-list-page',
  imports: [
    ButtonModule,
    EmptyStateComponent,
    MessageModule,
    PageHeaderComponent,
    PaginatorModule,
    RouterLink,
    StatusBadgeComponent,
    TableModule,
  ],
  templateUrl: './organization-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationListPageComponent implements OnInit {
  private readonly organizationsApi = inject(OrganizationsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly organizations = signal<OrganizationSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    this.loadOrganizations();
  }

  retry(): void {
    this.loadOrganizations(this.page());
  }

  onPageChange(event: PaginatorState): void {
    const page = event.page ?? 0;
    const size = event.rows ?? this.size();
    this.size.set(size);
    this.loadOrganizations(page);
  }

  statusState(status: OrganizationStatus): StatusBadgeState {
    return status.toLowerCase() as StatusBadgeState;
  }

  location(organization: OrganizationSummary): string {
    return [organization.city, organization.stateCode, organization.countryCode]
      .filter((value): value is string => Boolean(value))
      .join(', ');
  }

  private loadOrganizations(page = 0): void {
    if (this.loading() && this.organizations().length > 0) return;

    this.loading.set(true);
    this.error.set(null);

    this.organizationsApi
      .list({ page, size: this.size(), sort: 'legalName,asc' })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.organizations.set([...response.content]);
          this.page.set(response.page);
          this.size.set(response.size);
          this.totalElements.set(response.totalElements);
        },
        error: (error: unknown) => {
          this.organizations.set([]);
          this.totalElements.set(0);
          this.error.set(mapApiError(error));
        },
      });
  }
}
