import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { ApiError } from '../../../../core/http/api-error.model';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { AvailabilityRequest, AvailabilitySchedule, SCHEDULE_BLOCK_TYPES, ScheduleBlock, ScheduleBlockRequest, ScheduleBlockType } from '../../models/scheduling.model';
import { Specialist } from '../../models/specialist.model';
import { AvailabilityApiService } from '../../services/availability-api.service';
import { SpecialistsApiService } from '../../services/specialists-api.service';

export const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

@Component({ selector: 'app-specialist-availability-page', imports: [ButtonModule, MessageModule, PageHeaderComponent, PaginatorModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent], templateUrl: './specialist-availability-page.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SpecialistAvailabilityPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly api = inject(AvailabilityApiService); private readonly specialistsApi = inject(SpecialistsApiService); private readonly branchesApi = inject(BranchesApiService); private readonly auth = inject(AuthSessionService); private readonly destroyRef = inject(DestroyRef);
  readonly specialistId = Number(this.route.snapshot.paramMap.get('specialistId'));
  readonly weekDays = WEEK_DAYS; readonly blockTypes = SCHEDULE_BLOCK_TYPES;
  readonly specialist = signal<Specialist | null>(null); readonly branches = signal<readonly Branch[]>([]); readonly availability = signal<readonly AvailabilitySchedule[]>([]); readonly blocks = signal<readonly ScheduleBlock[]>([]);
  readonly loading = signal(true); readonly error = signal<ApiError | null>(null); readonly scheduleError = signal<ApiError | null>(null); readonly blockError = signal<ApiError | null>(null); readonly savingSchedule = signal(false); readonly savingBlock = signal(false);
  readonly scheduleEditorOpen = signal(false); readonly blockEditorOpen = signal(false); readonly editingScheduleId = signal<number | null>(null); readonly editingBlockId = signal<number | null>(null); readonly blockPage = signal(0); readonly blockSize = signal(10); readonly blockTotal = signal(0);
  readonly canManage = () => this.auth.hasPermission('SCHEDULE_MANAGE');
  readonly scheduleForm = new FormGroup({ branchId: new FormControl<number | null>(null, Validators.required), dayOfWeek: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(6)] }), startTime: new FormControl('09:00', { nonNullable: true, validators: Validators.required }), endTime: new FormControl('17:00', { nonNullable: true, validators: Validators.required }), validFrom: new FormControl<string | null>(null), validUntil: new FormControl<string | null>(null), active: new FormControl(true, { nonNullable: true }) }, { validators: [timeRangeValidator, dateRangeValidator] });
  readonly blockForm = new FormGroup({ branchId: new FormControl<number | null>(null), blockType: new FormControl<ScheduleBlockType>('BREAK', { nonNullable: true, validators: Validators.required }), startsAt: new FormControl('', { nonNullable: true, validators: Validators.required }), endsAt: new FormControl('', { nonNullable: true, validators: Validators.required }), reason: new FormControl<string | null>(null), active: new FormControl(true, { nonNullable: true }) }, { validators: dateTimeRangeValidator });

  ngOnInit(): void { this.load(); }
  retry(): void { this.load(this.blockPage()); }
  schedulesFor(day: number): readonly AvailabilitySchedule[] { return this.availability().filter((item) => item.dayOfWeek === day); }
  branchName(branchId: number | null): string { return branchId === null ? 'All assigned branches' : this.branches().find((branch) => branch.id === branchId)?.name ?? `Branch ${branchId}`; }
  openNewSchedule(day = 1): void { this.editingScheduleId.set(null); this.scheduleForm.reset({ branchId: this.branches()[0]?.id ?? null, dayOfWeek: day, startTime: '09:00', endTime: '17:00', validFrom: null, validUntil: null, active: true }); this.scheduleError.set(null); this.scheduleEditorOpen.set(true); }
  editSchedule(item: AvailabilitySchedule): void { this.editingScheduleId.set(item.id); this.scheduleForm.reset({ branchId: item.branchId, dayOfWeek: item.dayOfWeek, startTime: trimSeconds(item.startTime), endTime: trimSeconds(item.endTime), validFrom: item.validFrom, validUntil: item.validUntil, active: item.active }); this.scheduleError.set(null); this.scheduleEditorOpen.set(true); }
  cancelSchedule(): void { this.scheduleEditorOpen.set(false); this.scheduleError.set(null); }
  saveSchedule(): void {
    if (this.scheduleForm.invalid || this.savingSchedule()) { this.scheduleForm.markAllAsTouched(); return; }
    const organizationId = this.auth.activeOrganization()?.id; const value = this.scheduleForm.getRawValue(); if (!organizationId || value.branchId === null) return;
    const request: AvailabilityRequest = { branchId: value.branchId, dayOfWeek: value.dayOfWeek, startTime: value.startTime, endTime: value.endTime, validFrom: value.validFrom || null, validUntil: value.validUntil || null, active: value.active };
    const editingId = this.editingScheduleId(); const operation = editingId ? this.api.updateAvailability(organizationId, this.specialistId, editingId, request) : this.api.createAvailability(organizationId, this.specialistId, request);
    this.savingSchedule.set(true); this.scheduleError.set(null); operation.pipe(finalize(() => this.savingSchedule.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.scheduleEditorOpen.set(false); this.reloadAvailability(); }, error: (error: unknown) => this.scheduleError.set(mapApiError(error)) });
  }
  openNewBlock(): void { this.editingBlockId.set(null); this.blockForm.reset({ branchId: null, blockType: 'BREAK', startsAt: '', endsAt: '', reason: null, active: true }); this.blockError.set(null); this.blockEditorOpen.set(true); }
  editBlock(item: ScheduleBlock): void { this.editingBlockId.set(item.id); this.blockForm.reset({ branchId: item.branchId, blockType: item.blockType, startsAt: toLocalDateTimeInput(item.startsAt), endsAt: toLocalDateTimeInput(item.endsAt), reason: item.reason, active: item.active }); this.blockError.set(null); this.blockEditorOpen.set(true); }
  cancelBlock(): void { this.blockEditorOpen.set(false); this.blockError.set(null); }
  saveBlock(): void {
    if (this.blockForm.invalid || this.savingBlock()) { this.blockForm.markAllAsTouched(); return; }
    const organizationId = this.auth.activeOrganization()?.id; if (!organizationId) return; const value = this.blockForm.getRawValue();
    const request: ScheduleBlockRequest = { branchId: value.branchId, blockType: value.blockType, startsAt: new Date(value.startsAt).toISOString(), endsAt: new Date(value.endsAt).toISOString(), reason: value.reason?.trim() || null, active: value.active };
    const editingId = this.editingBlockId(); const operation = editingId ? this.api.updateBlock(organizationId, this.specialistId, editingId, request) : this.api.createBlock(organizationId, this.specialistId, request);
    this.savingBlock.set(true); this.blockError.set(null); operation.pipe(finalize(() => this.savingBlock.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.blockEditorOpen.set(false); this.reloadBlocks(this.blockPage()); }, error: (error: unknown) => this.blockError.set(mapApiError(error)) });
  }
  onBlockPage(event: PaginatorState): void { this.blockSize.set(event.rows ?? this.blockSize()); this.reloadBlocks(event.page ?? 0); }
  displayDateTime(value: string): string { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
  private load(page = 0): void {
    const organizationId = this.auth.activeOrganization()?.id; if (!organizationId || !Number.isSafeInteger(this.specialistId) || this.specialistId <= 0) { this.loading.set(false); this.error.set({ timestamp: null, status: 400, code: 'INVALID_SPECIALIST_ID', message: 'The specialist identifier is invalid.', path: null }); return; }
    this.loading.set(true); this.error.set(null);
    forkJoin({ specialist: this.specialistsApi.get(organizationId, this.specialistId), branches: this.branchesApi.list(organizationId, { page: 0, size: 100, sort: 'name,asc' }), availability: this.api.listAvailability(organizationId, this.specialistId), blocks: this.api.listBlocks(organizationId, this.specialistId, { page, size: this.blockSize(), sort: 'startsAt,desc' }) }).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: ({ specialist, branches, availability, blocks }) => { this.specialist.set(specialist); this.branches.set(branches.content); this.availability.set(availability); this.setBlocks(blocks); }, error: (error: unknown) => this.error.set(mapApiError(error)) });
  }
  private reloadAvailability(): void { const organizationId = this.auth.activeOrganization()?.id; if (!organizationId) return; this.api.listAvailability(organizationId, this.specialistId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (items) => this.availability.set(items), error: (error: unknown) => this.scheduleError.set(mapApiError(error)) }); }
  private reloadBlocks(page: number): void { const organizationId = this.auth.activeOrganization()?.id; if (!organizationId) return; this.api.listBlocks(organizationId, this.specialistId, { page, size: this.blockSize(), sort: 'startsAt,desc' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => this.setBlocks(result), error: (error: unknown) => this.blockError.set(mapApiError(error)) }); }
  private setBlocks(result: { readonly content: readonly ScheduleBlock[]; readonly page: number; readonly size: number; readonly totalElements: number }): void { this.blocks.set(result.content); this.blockPage.set(result.page); this.blockSize.set(result.size); this.blockTotal.set(result.totalElements); }
}

const timeRangeValidator: ValidatorFn = (control): ValidationErrors | null => { const start = control.get('startTime')?.value; const end = control.get('endTime')?.value; return typeof start === 'string' && typeof end === 'string' && start >= end ? { timeOrder: true } : null; };
const dateRangeValidator: ValidatorFn = (control): ValidationErrors | null => { const start = control.get('validFrom')?.value; const end = control.get('validUntil')?.value; return typeof start === 'string' && typeof end === 'string' && start && end && start > end ? { dateOrder: true } : null; };
const dateTimeRangeValidator: ValidatorFn = (control): ValidationErrors | null => { const start = control.get('startsAt')?.value; const end = control.get('endsAt')?.value; return typeof start === 'string' && typeof end === 'string' && start && end && start >= end ? { timeOrder: true } : null; };
function trimSeconds(value: string): string { return value.slice(0, 5); }
function toLocalDateTimeInput(value: string): string { const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
