import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { AppComponent } from './app';
import { routes } from './app.routes';
import { AgendaFlowPreset } from './core/config/agendaflow.preset';
import { AuthSessionService } from './core/security/auth-session.service';
import { AuthSessionStub } from './testing/auth-fixtures';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: AuthSessionService, useValue: new AuthSessionStub() },
      ],
    }).compileComponents();
  });

  it('should create the app without routing errors', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should redirect the root route to the dashboard and render the application shell', async () => {
    const fixture = await renderRoute('/');
    const router = TestBed.inject(Router);
    const content = fixture.nativeElement.textContent as string;

    expect(router.url).toBe('/dashboard');
    expect(fixture.nativeElement.querySelector('app-shell')).toBeTruthy();
    expect(content).toContain('AgendaFlow');
    expect(content).toContain('Development');
    expect(content).toContain('Dashboard en preparación');
  });

  it('should navigate between technical feature routes', async () => {
    const fixture = await renderRoute('/customers');
    const router = TestBed.inject(Router);

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Customers');

    await router.navigateByUrl('/services');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/services');
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Services');
    expect(fixture.nativeElement.textContent).toContain(
      'Catálogo de servicios aún no implementado',
    );
  });

  it('should open and close the mobile navigation and restore menu focus', async () => {
    const fixture = await renderRoute('/dashboard');
    const menuButton = fixture.nativeElement.querySelector(
      '.topbar__menu-button',
    ) as HTMLButtonElement;

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');

    menuButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#primary-navigation')?.getAttribute('data-open'),
    ).toBe('true');

    const closeButton = fixture.nativeElement.querySelector(
      '.sidebar__mobile-heading button',
    ) as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton);
  });

  it('should navigate unknown paths to the public technical 404 page', async () => {
    const fixture = await renderRoute('/ruta-inexistente');
    const content = fixture.nativeElement.textContent as string;

    expect(fixture.nativeElement.querySelector('app-shell')).toBeFalsy();
    expect(content).toContain('Error 404');
    expect(content).toContain('Página no encontrada');
  });

  async function renderRoute(path: string) {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    await router.navigateByUrl(path);
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }
});
