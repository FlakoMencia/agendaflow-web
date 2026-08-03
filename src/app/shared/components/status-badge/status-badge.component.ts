import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusBadgeState = 'active' | 'inactive' | 'pending' | 'confirmed' | 'cancelled';

interface StatusPresentation {
  readonly label: string;
  readonly icon: string;
}

const STATUS_PRESENTATIONS: Record<StatusBadgeState, StatusPresentation> = {
  active: { label: 'Activo', icon: 'pi pi-check-circle' },
  inactive: { label: 'Inactivo', icon: 'pi pi-minus-circle' },
  pending: { label: 'Pendiente', icon: 'pi pi-clock' },
  confirmed: { label: 'Confirmado', icon: 'pi pi-verified' },
  cancelled: { label: 'Cancelado', icon: 'pi pi-times-circle' },
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusBadgeState>();
  protected readonly presentation = computed(() => STATUS_PRESENTATIONS[this.status()]);
}
