import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { AuthSessionService } from './auth-session.service';
import { safeReturnUrl } from './safe-return-url';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(API_CONFIG);
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const isAgendaFlowApi = request.url === baseUrl || request.url.startsWith(`${baseUrl}/`);
  const isLoginRequest = request.url === `${baseUrl}/auth/login`;
  const token = auth.accessToken();

  const authenticatedRequest =
    isAgendaFlowApi && !isLoginRequest && token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (isHttpStatus(error, 401) && isAgendaFlowApi && !isLoginRequest) {
        auth.clearSession();
        if (!router.url.startsWith('/login')) {
          const returnUrl = safeReturnUrl(router.url);
          void router.navigate(['/login'], { queryParams: { returnUrl } });
        }
      } else if (
        isHttpStatus(error, 403) &&
        isAgendaFlowApi &&
        !router.url.startsWith('/access-denied')
      ) {
        void router.navigate(['/access-denied']);
      }
      return throwError(() => error);
    }),
  );
};

function isHttpStatus(error: unknown, status: number): boolean {
  return (
    typeof error === 'object' && error !== null && 'status' in error && error.status === status
  );
}
