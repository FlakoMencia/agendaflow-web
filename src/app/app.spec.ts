import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { AppComponent } from './app';
import { routes } from './app.routes';
import { AgendaFlowPreset } from './core/config/agendaflow.preset';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
      ],
    }).compileComponents();
  });

  it('should create the app without routing errors', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render AgendaFlow and the Phase 0 status', async () => {
    const fixture = await renderRoute('/');
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('AgendaFlow');
    expect(content).toContain('Fase 0 — Bootstrap');
  });

  it('should navigate unknown paths to the 404 page', async () => {
    const fixture = await renderRoute('/ruta-inexistente');
    const content = fixture.nativeElement.textContent as string;

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
