import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { CatalogService } from '../../../services/models/service-catalog.model';
import { ServicesApiService } from '../../../services/services/services-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Specialist, SpecialistBranchAssignment, SpecialistServiceAssignment } from '../../models/specialist.model';
import { SpecialistsApiService } from '../../services/specialists-api.service';

interface BranchAssignmentView { readonly branch: Branch; readonly active: boolean; readonly primary: boolean; readonly saving: boolean; }
interface ServiceAssignmentView { readonly service: CatalogService; readonly active: boolean; readonly customDurationMinutes: number | null; readonly customPrice: number | null; readonly saving: boolean; }

@Component({ selector: 'app-specialist-detail-page', imports: [ButtonModule, MessageModule, PageHeaderComponent, RouterLink, StatusBadgeComponent], templateUrl: './specialist-detail-page.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SpecialistDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly api = inject(SpecialistsApiService); private readonly branchesApi = inject(BranchesApiService); private readonly servicesApi = inject(ServicesApiService); private readonly auth = inject(AuthSessionService); private readonly destroyRef = inject(DestroyRef);
  readonly specialistId = Number(this.route.snapshot.paramMap.get('specialistId')); readonly saved = this.route.snapshot.queryParamMap.get('saved');
  readonly specialist = signal<Specialist | null>(null); readonly branches = signal<readonly BranchAssignmentView[]>([]); readonly services = signal<readonly ServiceAssignmentView[]>([]); readonly loading = signal(true); readonly error = signal<ApiError | null>(null); readonly assignmentError = signal<ApiError | null>(null);
  readonly canManage = () => this.auth.hasPermission('SPECIALISTS_MANAGE'); readonly canViewSchedule = () => this.auth.hasPermission('SCHEDULE_VIEW');
  ngOnInit(): void { this.load(); }
  retry(): void { this.load(); }
  onBranchActive(item: BranchAssignmentView, event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.patchBranch(item.branch.id, { active: target.checked }); }
  onBranchPrimary(item: BranchAssignmentView, event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.patchBranch(item.branch.id, { primary: target.checked }); }
  saveBranch(item: BranchAssignmentView): void {
    const organizationId = this.auth.activeOrganization()?.id; if (!organizationId || item.saving) return;
    this.assignmentError.set(null); this.patchBranch(item.branch.id, { saving: true });
    this.api.assignBranch(organizationId, this.specialistId, item.branch.id, { active: item.active, primary: item.primary }).pipe(finalize(() => this.patchBranch(item.branch.id, { saving: false })), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (assignment) => this.patchBranch(item.branch.id, { active: assignment.active, primary: assignment.primary }), error: (error: unknown) => this.assignmentError.set(mapApiError(error)) });
  }
  onServiceActive(item: ServiceAssignmentView, event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.patchService(item.service.id, { active: target.checked }); }
  onServiceDuration(item: ServiceAssignmentView, event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.patchService(item.service.id, { customDurationMinutes: parseOptionalNumber(target.value) }); }
  onServicePrice(item: ServiceAssignmentView, event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.patchService(item.service.id, { customPrice: parseOptionalNumber(target.value) }); }
  saveService(item: ServiceAssignmentView): void {
    const organizationId = this.auth.activeOrganization()?.id; if (!organizationId || item.saving) return;
    if ((item.customDurationMinutes !== null && item.customDurationMinutes < 1) || (item.customPrice !== null && item.customPrice < 0)) return;
    this.assignmentError.set(null); this.patchService(item.service.id, { saving: true });
    this.api.assignService(organizationId, this.specialistId, item.service.id, { active: item.active, customDurationMinutes: item.customDurationMinutes, customPrice: item.customPrice }).pipe(finalize(() => this.patchService(item.service.id, { saving: false })), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (assignment) => this.patchService(item.service.id, { active: assignment.active, customDurationMinutes: assignment.customDurationMinutes, customPrice: assignment.customPrice }), error: (error: unknown) => this.assignmentError.set(mapApiError(error)) });
  }
  private load(): void {
    const organizationId = this.auth.activeOrganization()?.id;
    if (!organizationId || !Number.isSafeInteger(this.specialistId) || this.specialistId <= 0) { this.loading.set(false); this.error.set({ timestamp: null, status: 400, code: 'INVALID_SPECIALIST_ID', message: 'The specialist identifier is invalid.', path: null }); return; }
    this.loading.set(true); this.error.set(null);
    forkJoin({ specialist: this.api.get(organizationId, this.specialistId), availableBranches: this.branchesApi.list(organizationId, { page: 0, size: 100, sort: 'name,asc' }), branchAssignments: this.api.listBranches(organizationId, this.specialistId), availableServices: this.servicesApi.list(organizationId, { page: 0, size: 100, sort: 'name,asc' }), serviceAssignments: this.api.listServices(organizationId, this.specialistId) })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: ({ specialist, availableBranches, branchAssignments, availableServices, serviceAssignments }) => { this.specialist.set(specialist); this.branches.set(availableBranches.content.map((branch) => toBranchView(branch, branchAssignments))); this.services.set(availableServices.content.map((service) => toServiceView(service, serviceAssignments))); }, error: (error: unknown) => this.error.set(mapApiError(error)) });
  }
  private patchBranch(branchId: number, patch: Partial<BranchAssignmentView>): void { this.branches.update((items) => items.map((item) => item.branch.id === branchId ? { ...item, ...patch } : item)); }
  private patchService(serviceId: number, patch: Partial<ServiceAssignmentView>): void { this.services.update((items) => items.map((item) => item.service.id === serviceId ? { ...item, ...patch } : item)); }
}
function toBranchView(branch: Branch, assignments: readonly SpecialistBranchAssignment[]): BranchAssignmentView { const assignment = assignments.find((item) => item.branchId === branch.id); return { branch, active: assignment?.active ?? false, primary: assignment?.primary ?? false, saving: false }; }
function toServiceView(service: CatalogService, assignments: readonly SpecialistServiceAssignment[]): ServiceAssignmentView { const assignment = assignments.find((item) => item.serviceId === service.id); return { service, active: assignment?.active ?? false, customDurationMinutes: assignment?.customDurationMinutes ?? null, customPrice: assignment?.customPrice ?? null, saving: false }; }
function parseOptionalNumber(value: string): number | null { return value.trim() === '' ? null : Number(value); }
