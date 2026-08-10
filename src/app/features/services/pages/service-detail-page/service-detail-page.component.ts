import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CatalogService } from '../../models/service-catalog.model';
import { ServicesApiService } from '../../services/services-api.service';

interface ServiceBranchView { readonly branch: Branch; readonly active: boolean; readonly saving: boolean; }

@Component({
  selector: 'app-service-detail-page',
  imports: [ButtonModule, MessageModule, PageHeaderComponent, RouterLink, StatusBadgeComponent],
  templateUrl: './service-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ServicesApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly serviceId = Number(this.route.snapshot.paramMap.get('serviceId'));
  readonly saved = this.route.snapshot.queryParamMap.get('saved');
  readonly service = signal<CatalogService | null>(null);
  readonly branches = signal<readonly ServiceBranchView[]>([]);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly assignmentError = signal<ApiError | null>(null);
  readonly canManage = () => this.auth.hasPermission('SERVICES_MANAGE');
  ngOnInit(): void { this.load(); }
  retry(): void { this.load(); }
  toggleBranch(item: ServiceBranchView): void {
    if (item.saving) return;
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId) return;
    this.assignmentError.set(null);
    this.branches.update((items) => items.map((candidate) => candidate.branch.id === item.branch.id ? { ...candidate, saving: true } : candidate));
    this.api.assignBranch(organizationId, item.branch.id, this.serviceId, { active: !item.active })
      .pipe(finalize(() => this.branches.update((items) => items.map((candidate) => candidate.branch.id === item.branch.id ? { ...candidate, saving: false } : candidate))), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (assignment) => this.branches.update((items) => items.map((candidate) => candidate.branch.id === item.branch.id ? { ...candidate, active: assignment.active } : candidate)), error: (error: unknown) => this.assignmentError.set(mapApiError(error)) });
  }
  private load(): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId || !Number.isSafeInteger(this.serviceId) || this.serviceId <= 0) { this.loading.set(false); this.error.set({ timestamp: null, status: 400, code: 'INVALID_SERVICE_ID', message: 'The service identifier is invalid.', path: null }); return; }
    this.loading.set(true); this.error.set(null);
    forkJoin({ service: this.api.get(organizationId, this.serviceId), branches: this.branchesApi.list(organizationId, { page: 0, size: 100, sort: 'name,asc' }) })
      .pipe(
        map(({ service, branches }) => ({ service, branchList: branches.content })),
        catchError((error: unknown) => { throw error; }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ service, branchList }) => {
          this.service.set(service);
          if (branchList.length === 0) { this.branches.set([]); this.loading.set(false); return; }
          forkJoin(branchList.map((branch) => this.api.listBranchServices(organizationId, branch.id).pipe(map((assignments): ServiceBranchView => ({ branch, active: assignments.some((assignment) => assignment.serviceId === this.serviceId && assignment.active), saving: false })), catchError(() => of<ServiceBranchView>({ branch, active: false, saving: false })))))
            .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: (items) => this.branches.set(items), error: (error: unknown) => this.error.set(mapApiError(error)) });
        },
        error: (error: unknown) => { this.loading.set(false); this.error.set(mapApiError(error)); },
      });
  }
}
