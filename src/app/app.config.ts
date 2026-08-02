import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AgendaFlowPreset } from './core/config/agendaflow.preset';
import { API_CONFIG, DEVELOPMENT_API_CONFIG } from './core/config/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: AgendaFlowPreset,
        options: { darkModeSelector: false },
      },
    }),
    { provide: API_CONFIG, useValue: DEVELOPMENT_API_CONFIG },
  ]
};
