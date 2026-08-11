import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ApiError } from '../../../../core/http/api-error.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Customer, customerDisplayName } from '../../models/customer.model';
import { CustomersApiService } from '../../services/customers-api.service';
@Component({
  selector: 'app-customer-detail-page',
  imports: [ButtonModule, MessageModule, PageHeaderComponent, RouterLink, StatusBadgeComponent],
  templateUrl: './customer-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CustomersApiService);
  readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = Number(this.route.snapshot.paramMap.get('customerId'));
  readonly customer = signal<Customer | null>(null);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  ngOnInit(): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) return;
    this.api
      .get(oid, this.id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (c) => this.customer.set(c),
        error: (e: unknown) => this.error.set(mapApiError(e)),
      });
  }
  name(c: Customer): string {
    return customerDisplayName(c);
  }
}
