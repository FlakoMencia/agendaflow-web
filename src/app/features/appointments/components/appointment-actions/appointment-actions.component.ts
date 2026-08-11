import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { Permission } from '../../../../core/security/auth.models';
import { Appointment } from '../../models/appointment.model';

export type AppointmentLifecycleAction =
  | 'confirm'
  | 'checkIn'
  | 'start'
  | 'complete'
  | 'noShow';

@Component({
  selector: 'app-appointment-actions',
  imports: [ButtonModule, RouterLink],
  templateUrl: './appointment-actions.component.html',
  styleUrl: './appointment-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentActionsComponent {
  readonly appointment = input.required<Appointment>();
  readonly permissions = input.required<readonly Permission[]>();
  readonly platformAdmin = input(false);
  readonly saving = input<AppointmentLifecycleAction | 'cancel' | null>(null);
  readonly actionRequested = output<AppointmentLifecycleAction>();
  readonly cancelRequested = output<void>();

  protected readonly canConfirm = computed(
    () => this.can('APPOINTMENTS_UPDATE') && this.appointment().status === 'PENDING',
  );
  protected readonly canCheckIn = computed(
    () => this.can('APPOINTMENTS_UPDATE') && this.appointment().status === 'CONFIRMED',
  );
  protected readonly canStart = computed(
    () => this.can('APPOINTMENTS_UPDATE') && this.appointment().status === 'CHECKED_IN',
  );
  protected readonly canComplete = computed(
    () => this.can('APPOINTMENTS_COMPLETE') && this.appointment().status === 'IN_PROGRESS',
  );
  protected readonly canReschedule = computed(
    () =>
      this.can('APPOINTMENTS_UPDATE') &&
      (this.appointment().status === 'PENDING' || this.appointment().status === 'CONFIRMED'),
  );
  protected readonly canCancel = computed(
    () =>
      this.can('APPOINTMENTS_CANCEL') &&
      (this.appointment().status === 'PENDING' || this.appointment().status === 'CONFIRMED'),
  );
  protected readonly canNoShow = computed(() => {
    const status = this.appointment().status;
    return (
      this.can('APPOINTMENTS_COMPLETE') &&
      (status === 'PENDING' || status === 'CONFIRMED' || status === 'CHECKED_IN') &&
      new Date(this.appointment().startsAt).getTime() <= Date.now()
    );
  });
  protected readonly hasActions = computed(
    () =>
      this.canConfirm() ||
      this.canCheckIn() ||
      this.canStart() ||
      this.canComplete() ||
      this.canReschedule() ||
      this.canCancel() ||
      this.canNoShow(),
  );

  protected request(action: AppointmentLifecycleAction): void {
    if (this.saving()) return;
    this.actionRequested.emit(action);
  }

  protected cancel(): void {
    if (this.saving()) return;
    this.cancelRequested.emit();
  }

  private can(permission: Permission): boolean {
    return this.platformAdmin() || this.permissions().includes(permission);
  }
}
