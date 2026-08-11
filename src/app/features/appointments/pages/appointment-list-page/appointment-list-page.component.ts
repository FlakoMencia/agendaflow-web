import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ApiError } from '../../../../core/http/api-error.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  StatusBadgeComponent,
  StatusBadgeState,
} from '../../../../shared/components/status-badge/status-badge.component';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { Customer, customerDisplayName } from '../../../customers/models/customer.model';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { Specialist } from '../../../specialists/models/specialist.model';
import { SpecialistsApiService } from '../../../specialists/services/specialists-api.service';
import {
  Appointment,
  AppointmentListRequest,
  AppointmentStatus,
} from '../../models/appointment.model';
import { AppointmentsApiService } from '../../services/appointments-api.service';

@Component({
  selector: 'app-appointment-list-page',
  imports: [
    ButtonModule,
    DatePipe,
    EmptyStateComponent,
    MessageModule,
    PageHeaderComponent,
    PaginatorModule,
    ReactiveFormsModule,
    RouterLink,
    StatusBadgeComponent,
    TableModule,
  ],
  templateUrl: './appointment-list-page.component.html',
  styleUrl: './appointment-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentListPageComponent implements OnInit {
  private readonly api = inject(AppointmentsApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly specialistsApi = inject(SpecialistsApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly appointments = signal<Appointment[]>([]);
  readonly branches = signal<readonly Branch[]>([]);
  readonly specialists = signal<readonly Specialist[]>([]);
  readonly customers = signal<readonly Customer[]>([]);
  readonly loading = signal(true);
  readonly error = signal<ApiError | null>(null);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly total = signal(0);
  readonly statuses: readonly AppointmentStatus[] = [
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED',
  ];
  readonly filters = new FormGroup({
    from: new FormControl(this.route.snapshot.queryParamMap.get('from') ?? today()),
    to: new FormControl(this.route.snapshot.queryParamMap.get('to') ?? addDays(7)),
    branchId: new FormControl<number | null>(numberParam(this.route, 'branchId')),
    specialistId: new FormControl<number | null>(numberParam(this.route, 'specialistId')),
    customerId: new FormControl<number | null>(numberParam(this.route, 'customerId')),
    status: new FormControl<AppointmentStatus | null>(
      this.route.snapshot.queryParamMap.get('status') as AppointmentStatus | null,
    ),
  });
  readonly canCreate = () => this.auth.hasPermission('APPOINTMENTS_CREATE');
  ngOnInit(): void {
    this.load();
  }
  applyFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.query(),
      replaceUrl: true,
    });
    this.load(0);
  }
  clearFilters(): void {
    this.filters.reset({
      from: today(),
      to: addDays(7),
      branchId: null,
      specialistId: null,
      customerId: null,
      status: null,
    });
    this.applyFilters();
  }
  applyPreset(preset: 'today' | 'upcoming'): void {
    this.filters.patchValue({
      from: today(),
      to: preset === 'today' ? today() : addDays(30),
    });
    this.applyFilters();
  }
  onPageChange(event: PaginatorState): void {
    this.size.set(event.rows ?? this.size());
    this.load(event.page ?? 0);
  }
  retry(): void {
    this.load(this.page());
  }
  branchName(id: number): string {
    return this.branches().find((x) => x.id === id)?.name ?? `Branch #${id}`;
  }
  specialistName(id: number): string {
    return this.specialists().find((x) => x.id === id)?.professionalName ?? `Specialist #${id}`;
  }
  customerName(id: number): string {
    const c = this.customers().find((x) => x.id === id);
    return c ? customerDisplayName(c) : `Customer #${id}`;
  }
  badge(status: AppointmentStatus): StatusBadgeState {
    return status.toLowerCase() as StatusBadgeState;
  }
  private load(page = 0): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      appointments: this.api.list(oid, {
        ...this.request(),
        page,
        size: this.size(),
        sort: 'startsAt,asc',
      }),
      branches: this.branchesApi.list(oid, { size: 100, sort: 'name,asc' }),
      specialists: this.specialistsApi.list(oid, { size: 100, sort: 'professionalName,asc' }),
      customers: this.customersApi.list(oid, { size: 100, sort: 'lastName,asc' }),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (r) => {
          this.appointments.set([...r.appointments.content]);
          this.page.set(r.appointments.page);
          this.size.set(r.appointments.size);
          this.total.set(r.appointments.totalElements);
          this.branches.set(r.branches.content);
          this.specialists.set(r.specialists.content);
          this.customers.set(r.customers.content);
        },
        error: (e: unknown) => this.error.set(mapApiError(e)),
      });
  }
  private request(): AppointmentListRequest {
    const v = this.filters.getRawValue();
    return {
      from: v.from ? startOfDay(v.from) : undefined,
      to: v.to ? endOfDay(v.to) : undefined,
      branchId: v.branchId ?? undefined,
      specialistId: v.specialistId ?? undefined,
      customerId: v.customerId ?? undefined,
      status: v.status ?? undefined,
    };
  }
  private query(): Record<string, string | number | null> {
    const v = this.filters.getRawValue();
    return {
      from: v.from,
      to: v.to,
      branchId: v.branchId,
      specialistId: v.specialistId,
      customerId: v.customerId,
      status: v.status,
    };
  }
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function startOfDay(d: string): string {
  return new Date(`${d}T00:00:00`).toISOString();
}
function endOfDay(d: string): string {
  return new Date(`${d}T23:59:59.999`).toISOString();
}
function numberParam(route: ActivatedRoute, key: string): number | null {
  const value = Number(route.snapshot.queryParamMap.get(key));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
