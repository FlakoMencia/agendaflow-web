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
import { finalize, forkJoin, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ActiveOrganization } from '../../../../core/security/auth.models';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { Organization } from '../../../organizations/models/organization.model';
import { OrganizationsApiService } from '../../../organizations/services/organizations-api.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Branch } from '../../models/branch.model';
import { BranchesApiService } from '../../services/branches-api.service';

@Component({
  selector: 'app-branch-list-page',
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
  templateUrl: './branch-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchListPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly organizationsApi = inject(OrganizationsApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthSessionService);

  readonly organizationId = Number(this.route.snapshot.paramMap.get('organizationId'));
  readonly saved = this.route.snapshot.queryParamMap.get('saved');
  readonly organization = signal<Organization | ActiveOrganization | null>(null);
  readonly branches = signal<Branch[]>([]);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalElements = signal(0);
  readonly canViewOrganization = () => this.auth.hasPermission('ORGANIZATION_VIEW');
  readonly canManageBranches = () => this.auth.hasPermission('BRANCHES_MANAGE');

  ngOnInit(): void {
    this.loadBranches();
  }

  retry(): void {
    this.loadBranches(this.page());
  }

  onPageChange(event: PaginatorState): void {
    this.size.set(event.rows ?? this.size());
    this.loadBranches(event.page ?? 0);
  }

  location(branch: Branch): string {
    return [branch.addressLine1, branch.city, branch.stateCode, branch.countryCode]
      .filter((value): value is string => Boolean(value))
      .join(', ');
  }

  private loadBranches(page = 0): void {
    if (!Number.isSafeInteger(this.organizationId) || this.organizationId <= 0) {
      this.loading.set(false);
      this.error.set(invalidOrganizationId());
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const activeOrganization = this.auth.activeOrganization();
    const organizationRequest = this.canViewOrganization()
      ? this.organizationsApi.get(this.organizationId)
      : activeOrganization?.id === this.organizationId
        ? of(activeOrganization)
        : of(null);

    forkJoin({
      organization: organizationRequest,
      branches: this.branchesApi.list(this.organizationId, {
        page,
        size: this.size(),
        sort: 'name,asc',
      }),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ organization, branches }) => {
          if (!organization) {
            this.error.set({
              timestamp: null,
              status: 403,
              code: 'ACCESS_DENIED',
              message: 'This branch directory is outside the active organization.',
              path: null,
            });
            return;
          }
          this.organization.set(organization);
          this.branches.set([...branches.content]);
          this.page.set(branches.page);
          this.size.set(branches.size);
          this.totalElements.set(branches.totalElements);
        },
        error: (error: unknown) => this.error.set(mapApiError(error)),
      });
  }
}

function invalidOrganizationId(): ApiError {
  return {
    timestamp: null,
    status: 400,
    code: 'INVALID_ORGANIZATION_ID',
    message: 'The organization identifier is invalid.',
    path: null,
  };
}
