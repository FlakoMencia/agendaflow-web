import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { Permission, Role } from './auth.models';
import { AuthSessionService } from './auth-session.service';
import { safeReturnUrl } from './safe-return-url';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  await auth.initialize();
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], {
        queryParams: { returnUrl: safeReturnUrl(state.url) },
      });
};

export const authChildGuard: CanActivateChildFn = (route, state) => authGuard(route, state);

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  await auth.initialize();
  return auth.isAuthenticated() ? router.parseUrl(auth.preferredAuthenticatedRoute()) : true;
};

export const permissionGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  await auth.initialize();

  const requiredPermissions = (route.data['permissions'] ?? []) as readonly Permission[];
  const requiredRoles = (route.data['roles'] ?? []) as readonly Role[];
  const permissionGranted =
    requiredPermissions.length > 0 && auth.hasAnyPermission(requiredPermissions);
  const roleGranted = requiredRoles.length > 0 && requiredRoles.some((role) => auth.hasRole(role));

  return permissionGranted || roleGranted ? true : router.parseUrl('/access-denied');
};
