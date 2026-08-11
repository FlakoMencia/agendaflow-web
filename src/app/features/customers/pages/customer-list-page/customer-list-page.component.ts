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
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Customer, customerDisplayName } from '../../models/customer.model';
import { CustomersApiService } from '../../services/customers-api.service';

@Component({
  selector: 'app-customer-list-page',
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
  templateUrl: './customer-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListPageComponent implements OnInit {
  private readonly api = inject(CustomersApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly total = signal(0);
  readonly canCreate = () => this.auth.hasPermission('CUSTOMERS_CREATE');
  readonly canUpdate = () => this.auth.hasPermission('CUSTOMERS_UPDATE');

  ngOnInit(): void {
    this.load();
  }
  retry(): void {
    this.load(this.page());
  }
  onPageChange(event: PaginatorState): void {
    this.size.set(event.rows ?? this.size());
    this.load(event.page ?? 0);
  }
  name(customer: Customer): string {
    return customerDisplayName(customer);
  }

  private load(page = 0): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list(organizationId, { page, size: this.size(), sort: 'lastName,asc' })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.customers.set([...result.content]);
          this.page.set(result.page);
          this.size.set(result.size);
          this.total.set(result.totalElements);
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }
}
