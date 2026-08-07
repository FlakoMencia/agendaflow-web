import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AgendaFlowPreset } from './core/config/agendaflow.preset';
import { API_CONFIG, DEVELOPMENT_API_CONFIG } from './core/config/api.config';
import { authInterceptor } from './core/security/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: AgendaFlowPreset,
        options: { darkModeSelector: false },
      },
    }),
    { provide: API_CONFIG, useValue: DEVELOPMENT_API_CONFIG },
  ],
};
