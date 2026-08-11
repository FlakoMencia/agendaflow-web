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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, forkJoin, of, Subject, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ApiError } from '../../../../core/http/api-error.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { Customer, customerDisplayName } from '../../../customers/models/customer.model';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { CatalogService } from '../../../services/models/service-catalog.model';
import { ServicesApiService } from '../../../services/services/services-api.service';
import {
  Specialist,
  SpecialistBranchAssignment,
  SpecialistServiceAssignment,
} from '../../../specialists/models/specialist.model';
import { SpecialistsApiService } from '../../../specialists/services/specialists-api.service';
import {
  AvailableSlot,
  AvailableSlotsRequest,
  CreateAppointmentRequest,
} from '../../models/appointment.model';
import { AppointmentsApiService } from '../../services/appointments-api.service';
import { AvailableSlotsApiService } from '../../services/available-slots-api.service';

interface CompatibleSpecialist {
  readonly specialist: Specialist;
  readonly branches: readonly SpecialistBranchAssignment[];
  readonly services: readonly SpecialistServiceAssignment[];
}
@Component({
  selector: 'app-appointment-booking-page',
  imports: [
    ButtonModule,
    DatePipe,
    MessageModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './appointment-booking-page.component.html',
  styleUrl: '../../styles/appointment-slots.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentBookingPageComponent implements OnInit {
  private readonly appointmentsApi = inject(AppointmentsApiService);
  private readonly slotsApi = inject(AvailableSlotsApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly servicesApi = inject(ServicesApiService);
  private readonly specialistsApi = inject(SpecialistsApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly slotRequests = new Subject<AvailableSlotsRequest>();
  readonly branches = signal<readonly Branch[]>([]);
  readonly allServices = signal<readonly CatalogService[]>([]);
  readonly services = signal<readonly CatalogService[]>([]);
  readonly allSpecialists = signal<readonly CompatibleSpecialist[]>([]);
  readonly specialists = signal<readonly Specialist[]>([]);
  readonly customers = signal<readonly Customer[]>([]);
  readonly slots = signal<readonly AvailableSlot[]>([]);
  readonly timezone = signal('');
  readonly selectedSlot = signal<AvailableSlot | null>(null);
  readonly loading = signal(true);
  readonly slotsLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ApiError | null>(null);
  readonly slotError = signal<ApiError | null>(null);
  readonly form = new FormGroup({
    customerId: new FormControl<number | null>(
      numberQuery(this.route, 'customerId'),
      Validators.required,
    ),
    branchId: new FormControl<number | null>(null, Validators.required),
    serviceId: new FormControl<number | null>(null, Validators.required),
    specialistId: new FormControl<number | null>(null),
    date: new FormControl(today(), { nonNullable: true, validators: Validators.required }),
    customerNotes: new FormControl<string | null>(null, Validators.maxLength(10000)),
    internalNotes: new FormControl<string | null>(null, Validators.maxLength(10000)),
  });
  constructor() {
    this.slotRequests
      .pipe(
        switchMap((request) => {
          this.slotsLoading.set(true);
          this.slotError.set(null);
          const oid = this.auth.activeOrganization()?.id;
          if (!oid) return EMPTY;
          return this.slotsApi.list(oid, request).pipe(
            finalize(() => this.slotsLoading.set(false)),
            catchError((e: unknown) => {
              this.slotError.set(mapApiError(e));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.slots.set(response.slots);
        this.timezone.set(response.timezone);
      });
  }
  ngOnInit(): void {
    this.loadContext();
  }
  customerName(c: Customer): string {
    return customerDisplayName(c);
  }
  selectSlot(slot: AvailableSlot): void {
    this.selectedSlot.set(slot);
    this.form.controls.specialistId.setValue(slot.specialistId);
  }
  branchChanged(): void {
    this.form.controls.serviceId.setValue(null);
    this.form.controls.specialistId.setValue(null);
    this.services.set([]);
    this.specialists.set([]);
    this.clearSlots();
    const oid = this.auth.activeOrganization()?.id;
    const branchId = this.form.controls.branchId.value;
    if (!oid || !branchId) return;
    this.servicesApi
      .listBranchServices(oid, branchId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (assignments) =>
          this.services.set(
            this.allServices().filter(
              (service) =>
                service.active && assignments.some((a) => a.serviceId === service.id && a.active),
            ),
          ),
        error: (e: unknown) => this.error.set(mapApiError(e)),
      });
  }
  contextChanged(): void {
    this.clearSlots();
    const branchId = this.form.controls.branchId.value;
    const serviceId = this.form.controls.serviceId.value;
    this.form.controls.specialistId.setValue(null);
    if (!branchId || !serviceId) {
      this.specialists.set([]);
      return;
    }
    this.specialists.set(
      this.allSpecialists()
        .filter(
          (item) =>
            item.specialist.active &&
            item.branches.some((a) => a.branchId === branchId && a.active) &&
            item.services.some((a) => a.serviceId === serviceId && a.active),
        )
        .map((item) => item.specialist),
    );
    this.requestSlots();
  }
  requestSlots(): void {
    this.clearSlots(false);
    const v = this.form.getRawValue();
    if (!v.branchId || !v.serviceId || !v.date) return;
    this.slotRequests.next({
      branchId: v.branchId,
      serviceId: v.serviceId,
      date: v.date,
      specialistId: v.specialistId ?? undefined,
    });
  }
  submit(): void {
    const slot = this.selectedSlot();
    if (this.form.invalid || !slot || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) return;
    const v = this.form.getRawValue();
    const request: CreateAppointmentRequest = {
      customerId: v.customerId!,
      branchId: v.branchId!,
      serviceId: v.serviceId!,
      specialistId: slot.specialistId,
      startsAt: slot.start,
      customerNotes: clean(v.customerNotes),
      internalNotes: clean(v.internalNotes),
    };
    this.saving.set(true);
    this.error.set(null);
    this.appointmentsApi
      .create(oid, request)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (a) =>
          void this.router.navigate(['/appointments', a.id], { queryParams: { saved: 'created' } }),
        error: (e: unknown) => {
          const mapped = mapApiError(e);
          this.error.set(mapped);
          if (mapped.status === 409) {
            this.selectedSlot.set(null);
            this.requestSlots();
          }
        },
      });
  }
  specialistName(id: number): string {
    return (
      this.allSpecialists().find((x) => x.specialist.id === id)?.specialist.professionalName ??
      `Specialist #${id}`
    );
  }
  formatTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(
      new Date(value),
    );
  }
  private clearSlots(clearSelection = true): void {
    this.slots.set([]);
    this.slotError.set(null);
    if (clearSelection) this.selectedSlot.set(null);
  }
  private loadContext(): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) {
      this.loading.set(false);
      return;
    }
    forkJoin({
      branches: this.branchesApi.list(oid, { size: 100, sort: 'name,asc' }),
      services: this.servicesApi.list(oid, { size: 100, sort: 'name,asc' }),
      customers: this.customersApi.list(oid, { size: 100, sort: 'lastName,asc' }),
      specialists: this.specialistsApi.list(oid, { size: 100, sort: 'professionalName,asc' }),
    })
      .pipe(
        switchMap((base) =>
          forkJoin({
            base: of(base),
            compatibility: forkJoin(
              base.specialists.content.map((s) =>
                forkJoin({
                  specialist: of(s),
                  branches: this.specialistsApi.listBranches(oid, s.id),
                  services: this.specialistsApi.listServices(oid, s.id),
                }),
              ),
            ),
          }),
        ),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ base, compatibility }) => {
          this.branches.set(base.branches.content.filter((x) => x.active));
          this.allServices.set(base.services.content);
          this.customers.set(base.customers.content.filter((x) => x.active));
          this.allSpecialists.set(compatibility);
        },
        error: (e: unknown) => this.error.set(mapApiError(e)),
      });
  }
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function numberQuery(route: ActivatedRoute, key: string): number | null {
  const n = Number(route.snapshot.queryParamMap.get(key));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
function clean(value: string | null): string | null {
  return value?.trim() || null;
}
