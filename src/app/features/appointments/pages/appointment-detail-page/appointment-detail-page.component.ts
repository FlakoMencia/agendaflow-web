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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ApiError } from '../../../../core/http/api-error.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  StatusBadgeComponent,
  StatusBadgeState,
} from '../../../../shared/components/status-badge/status-badge.component';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { Customer, customerDisplayName } from '../../../customers/models/customer.model';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { CatalogService } from '../../../services/models/service-catalog.model';
import { ServicesApiService } from '../../../services/services/services-api.service';
import { Specialist } from '../../../specialists/models/specialist.model';
import { SpecialistsApiService } from '../../../specialists/services/specialists-api.service';
import {
  AppointmentActionsComponent,
  AppointmentLifecycleAction,
} from '../../components/appointment-actions/appointment-actions.component';
import {
  Appointment,
  AppointmentHistoryEntry,
  AppointmentStatus,
} from '../../models/appointment.model';
import { AppointmentsApiService } from '../../services/appointments-api.service';
@Component({
  selector: 'app-appointment-detail-page',
  imports: [
    ButtonModule,
    AppointmentActionsComponent,
    DatePipe,
    DialogModule,
    MessageModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    StatusBadgeComponent,
  ],
  templateUrl: './appointment-detail-page.component.html',
  styleUrl: './appointment-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AppointmentsApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly servicesApi = inject(ServicesApiService);
  private readonly specialistsApi = inject(SpecialistsApiService);
  readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = Number(this.route.snapshot.paramMap.get('appointmentId'));
  readonly appointment = signal<Appointment | null>(null);
  readonly history = signal<readonly AppointmentHistoryEntry[]>([]);
  readonly branch = signal<Branch | null>(null);
  readonly customer = signal<Customer | null>(null);
  readonly service = signal<CatalogService | null>(null);
  readonly specialist = signal<Specialist | null>(null);
  readonly loading = signal(true);
  readonly cancelling = signal(false);
  readonly cancelOpen = signal(false);
  readonly saving = signal<AppointmentLifecycleAction | null>(null);
  readonly pendingConfirmation = signal<'complete' | 'noShow' | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly error = signal<ApiError | null>(null);
  readonly actionError = signal<ApiError | null>(null);
  readonly cancelForm = new FormGroup({
    reason: new FormControl<string | null>(null, Validators.maxLength(10000)),
  });
  ngOnInit(): void {
    this.load();
  }
  badge(status: AppointmentStatus): StatusBadgeState {
    return status.toLowerCase() as StatusBadgeState;
  }
  customerName(): string {
    const c = this.customer();
    return c ? customerDisplayName(c) : `Customer #${this.appointment()?.customerId}`;
  }
  requestLifecycle(action: AppointmentLifecycleAction): void {
    if (this.saving() || this.cancelling()) return;
    if (action === 'complete' || action === 'noShow') {
      this.pendingConfirmation.set(action);
      return;
    }
    this.executeLifecycle(action);
  }
  confirmLifecycle(): void {
    const action = this.pendingConfirmation();
    if (!action) return;
    this.pendingConfirmation.set(null);
    this.executeLifecycle(action);
  }
  confirmCancel(): void {
    if (this.cancelling()) return;
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) return;
    this.cancelling.set(true);
    this.actionError.set(null);
    this.successMessage.set(null);
    this.api
      .cancel(oid, this.id, { reason: this.cancelForm.controls.reason.value?.trim() || null })
      .pipe(
        finalize(() => this.cancelling.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (a) => {
          this.appointment.set(a);
          this.cancelOpen.set(false);
          this.successMessage.set('Appointment cancelled.');
          this.reloadHistory();
        },
        error: (e: unknown) => this.actionError.set(mapApiError(e)),
      });
  }
  private executeLifecycle(action: AppointmentLifecycleAction): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid || this.saving()) return;
    this.saving.set(action);
    this.actionError.set(null);
    this.successMessage.set(null);
    const request =
      action === 'confirm'
        ? this.api.confirm(oid, this.id)
        : action === 'checkIn'
          ? this.api.checkIn(oid, this.id)
          : action === 'start'
            ? this.api.start(oid, this.id)
            : action === 'complete'
              ? this.api.complete(oid, this.id)
              : this.api.markNoShow(oid, this.id);
    request
      .pipe(
        finalize(() => this.saving.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (appointment) => {
          this.appointment.set(appointment);
          this.successMessage.set(successFor(action));
          this.reloadHistory();
        },
        error: (error: unknown) => {
          const mapped = appointmentActionError(mapApiError(error));
          this.actionError.set(mapped);
          if (
            mapped.status === 409 &&
            (mapped.code === 'INVALID_APPOINTMENT_TRANSITION' ||
              mapped.code === 'APPOINTMENT_NOT_DUE')
          ) {
            this.reloadAppointmentAndHistory();
          }
        },
      });
  }
  private load(): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) return;
    this.api
      .get(oid, this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (a) =>
          forkJoin({
            branch: this.branchesApi.get(oid, a.branchId),
            customer: this.customersApi.get(oid, a.customerId),
            service: this.servicesApi.get(oid, a.serviceId),
            specialist: this.specialistsApi.get(oid, a.specialistId),
            history: this.api.history(oid, a.id),
          })
            .pipe(
              finalize(() => this.loading.set(false)),
              takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
              next: (r) => {
                this.appointment.set(a);
                this.branch.set(r.branch);
                this.customer.set(r.customer);
                this.service.set(r.service);
                this.specialist.set(r.specialist);
                this.history.set(newestFirst(r.history));
              },
              error: (e: unknown) => this.error.set(mapApiError(e)),
            }),
        error: (e: unknown) => {
          this.loading.set(false);
          this.error.set(mapApiError(e));
        },
      });
  }
  private reloadHistory(): void {
    const oid = this.auth.activeOrganization()?.id;
    if (oid)
      this.api
        .history(oid, this.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((items) => this.history.set(newestFirst(items)));
  }
  private reloadAppointmentAndHistory(): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) return;
    forkJoin({ appointment: this.api.get(oid, this.id), history: this.api.history(oid, this.id) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ appointment, history }) => {
          this.appointment.set(appointment);
          this.history.set(newestFirst(history));
        },
      });
  }
}

function newestFirst(entries: readonly AppointmentHistoryEntry[]): readonly AppointmentHistoryEntry[] {
  return [...entries].sort((left, right) => right.changedAt.localeCompare(left.changedAt));
}

function successFor(action: AppointmentLifecycleAction): string {
  const labels: Record<AppointmentLifecycleAction, string> = {
    confirm: 'Appointment confirmed.',
    checkIn: 'Customer checked in.',
    start: 'Appointment started.',
    complete: 'Appointment completed.',
    noShow: 'Appointment marked as no-show.',
  };
  return labels[action];
}

function appointmentActionError(error: ApiError): ApiError {
  return error.code === 'APPOINTMENT_NOT_DUE'
    ? { ...error, message: 'This appointment cannot be marked as no-show before its scheduled time.' }
    : error;
}
