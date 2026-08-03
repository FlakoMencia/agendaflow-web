import { TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('should expose an accessible title and description', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'Módulo en preparación');
    fixture.componentRef.setInput(
      'description',
      'Esta capacidad se incorporará en una fase posterior.',
    );
    fixture.componentRef.setInput('icon', 'pi pi-clock');
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const heading = fixture.nativeElement.querySelector('h2') as HTMLHeadingElement;

    expect(heading.textContent).toContain('Módulo en preparación');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(fixture.nativeElement.textContent).toContain(
      'Esta capacidad se incorporará en una fase posterior.',
    );
  });
});
