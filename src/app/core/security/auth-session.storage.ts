import { InjectionToken } from '@angular/core';

export const AUTH_TOKEN_STORAGE_KEY = 'agendaflow.access-token';

export const AUTH_SESSION_STORAGE = new InjectionToken<Storage>('AgendaFlow session storage', {
  providedIn: 'root',
  factory: () => sessionStorage,
});
