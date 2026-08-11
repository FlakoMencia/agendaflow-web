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
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { mapApiError } from '../../../../core/http/api-error.mapper';
import { ApiError } from '../../../../core/http/api-error.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Specialist } from '../../../specialists/models/specialist.model';
import { SpecialistsApiService } from '../../../specialists/services/specialists-api.service';
import { Appointment, AvailableSlot, AvailableSlotsRequest } from '../../models/appointment.model';
import { AppointmentsApiService } from '../../services/appointments-api.service';
import { AvailableSlotsApiService } from '../../services/available-slots-api.service';
@Component({
  selector: 'app-appointment-reschedule-page',
  imports: [ButtonModule, MessageModule, PageHeaderComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './appointment-reschedule-page.component.html',
  styleUrl: '../../styles/appointment-slots.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentReschedulePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AppointmentsApiService);
  private readonly slotsApi = inject(AvailableSlotsApiService);
  private readonly specialistsApi = inject(SpecialistsApiService);
  private readonly auth = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<AvailableSlotsRequest>();
  readonly id = Number(this.route.snapshot.paramMap.get('appointmentId'));
  readonly appointment = signal<Appointment | null>(null);
  readonly specialists = signal<readonly Specialist[]>([]);
  readonly slots = signal<readonly AvailableSlot[]>([]);
  readonly selected = signal<AvailableSlot | null>(null);
  readonly loading = signal(true);
  readonly slotsLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ApiError | null>(null);
  readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    specialistId: new FormControl<number | null>(null),
    reason: new FormControl<string | null>(null, Validators.maxLength(10000)),
  });
  constructor() {
    this.requests
      .pipe(
        switchMap((r) => {
          this.slotsLoading.set(true);
          this.error.set(null);
          const oid = this.auth.activeOrganization()?.id;
          if (!oid) return EMPTY;
          return this.slotsApi.list(oid, r).pipe(
            finalize(() => this.slotsLoading.set(false)),
            catchError((e: unknown) => {
              this.error.set(mapApiError(e));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((r) => this.slots.set(r.slots));
  }
  ngOnInit(): void {
    const oid = this.auth.activeOrganization()?.id;
    if (!oid) return;
    this.api
      .get(oid, this.id)
      .pipe(
        switchMap((a) => {
          this.appointment.set(a);
          this.form.patchValue({ date: a.startsAt.slice(0, 10), specialistId: a.specialistId });
          return this.specialistsApi.list(oid, { size: 100, sort: 'professionalName,asc' });
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (r) => {
          this.specialists.set(r.content.filter((x) => x.active));
          this.refresh();
        },
        error: (e: unknown) => this.error.set(mapApiError(e)),
      });
  }
  refresh(): void {
    this.selected.set(null);
    this.slots.set([]);
    const a = this.appointment();
    const v = this.form.getRawValue();
    if (a && v.date)
      this.requests.next({
        branchId: a.branchId,
        serviceId: a.serviceId,
        date: v.date,
        specialistId: v.specialistId ?? undefined,
      });
  }
  select(slot: AvailableSlot): void {
    this.selected.set(slot);
  }
  name(id: number): string {
    return this.specialists().find((x) => x.id === id)?.professionalName ?? `Specialist #${id}`;
  }
  time(value: string): string {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(
      new Date(value),
    );
  }
  submit(): void {
    const oid = this.auth.activeOrganization()?.id;
    const slot = this.selected();
    if (!oid || !slot || this.saving()) return;
    this.saving.set(true);
    this.api
      .reschedule(oid, this.id, {
        startsAt: slot.start,
        specialistId: slot.specialistId,
        reason: this.form.controls.reason.value?.trim() || null,
      })
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () =>
          void this.router.navigate(['/appointments', this.id], {
            queryParams: { saved: 'rescheduled' },
          }),
        error: (e: unknown) => {
          const mapped = mapApiError(e);
          this.error.set(mapped);
          if (mapped.status === 409) {
            this.selected.set(null);
            this.refresh();
          }
        },
      });
  }
}
