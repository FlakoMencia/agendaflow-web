import { TestBed } from '@angular/core/testing';

import { StatusBadgeComponent, StatusBadgeState } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  it('should render text and an icon for every supported status', () => {
    const cases: readonly [StatusBadgeState, string][] = [
      ['active', 'Activo'],
      ['inactive', 'Inactivo'],
      ['pending', 'Pendiente'],
      ['suspended', 'Suspendido'],
      ['confirmed', 'Confirmado'],
      ['cancelled', 'Cancelado'],
    ];

    for (const [status, label] of cases) {
      const fixture = TestBed.createComponent(StatusBadgeComponent);
      fixture.componentRef.setInput('status', status);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(label);
      expect(fixture.nativeElement.querySelector('i')?.getAttribute('aria-hidden')).toBe('true');
      fixture.destroy();
    }
  });
});
