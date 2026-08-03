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

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  StatusBadgeComponent,
  StatusBadgeState,
} from '../../../../shared/components/status-badge/status-badge.component';
import { Organization, OrganizationStatus } from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';

@Component({
  selector: 'app-organization-detail-page',
  imports: [ButtonModule, MessageModule, PageHeaderComponent, RouterLink, StatusBadgeComponent],
  templateUrl: './organization-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly organizationsApi = inject(OrganizationsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly organization = signal<Organization | null>(null);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly saved = this.route.snapshot.queryParamMap.get('saved');
  readonly organizationId = Number(this.route.snapshot.paramMap.get('organizationId'));

  ngOnInit(): void {
    this.loadOrganization();
  }

  retry(): void {
    this.loadOrganization();
  }

  statusState(status: OrganizationStatus): StatusBadgeState {
    return status.toLowerCase() as StatusBadgeState;
  }

  value(value: string | number | null): string | number {
    return value === null || value === '' ? 'Not provided' : value;
  }

  yesNo(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  private loadOrganization(): void {
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

    this.loading.set(true);
    this.error.set(null);
    this.organizationsApi
      .get(this.organizationId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (organization) => this.organization.set(organization),
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }
}
