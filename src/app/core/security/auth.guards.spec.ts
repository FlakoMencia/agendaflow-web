import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthSessionStub } from '../../testing/auth-fixtures';
import { AuthSessionService } from './auth-session.service';
import { authGuard, guestGuard, permissionGuard } from './auth.guards';

describe('authentication and authorization guards', () => {
  let auth: AuthSessionStub;
  let router: Router;

  beforeEach(() => {
    auth = new AuthSessionStub([], ['ORGANIZATION_VIEW']);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSessionService, useValue: auth }],
    });
    router = TestBed.inject(Router);
  });

  it('allows authenticated access', async () => {
    await expect(runAuthGuard('/organizations')).resolves.toBe(true);
  });

  it('redirects unauthenticated users to login with a safe return URL', async () => {
    auth.setUnauthenticated();
    const result = await runAuthGuard('/organizations/42');
    expect(router.serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe(
      '/login?returnUrl=%2Forganizations%2F42',
    );
  });

  it('does not preserve an external-looking return URL', async () => {
    auth.setUnauthenticated();
    const result = await runAuthGuard('//untrusted.example');
    expect(router.serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe(
      '/login?returnUrl=%2Fdashboard',
    );
  });

  it('prevents authenticated users from returning to login', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      guestGuard(emptyRoute(), state('/login')),
    );
    expect(router.serializeUrl(result as ReturnType<Router['parseUrl']>)).toBe('/organizations');
  });

  it('allows a route when the required permission is present', async () => {
    await expect(runPermissionGuard({ permissions: ['ORGANIZATION_VIEW'] })).resolves.toBe(true);
  });

  it('redirects a route when the required permission is missing', async () => {
    const result = await runPermissionGuard({ permissions: ['BRANCHES_MANAGE'] });
    expect(router.serializeUrl(result as ReturnType<Router['parseUrl']>)).toBe('/access-denied');
  });

  it('allows PLATFORM_ADMIN routes by role and as the backend permission override', async () => {
    auth.setAuthorization(['PLATFORM_ADMIN'], []);
    await expect(runPermissionGuard({ roles: ['PLATFORM_ADMIN'] })).resolves.toBe(true);
    await expect(runPermissionGuard({ permissions: ['BRANCHES_MANAGE'] })).resolves.toBe(true);
  });

  function runAuthGuard(url: string) {
    return TestBed.runInInjectionContext(() =>
      authGuard(emptyRoute(), state(url)),
    ) as Promise<unknown>;
  }

  function runPermissionGuard(data: Record<string, readonly string[]>) {
    const route = { data } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() =>
      permissionGuard(route, state('/protected')),
    ) as Promise<unknown>;
  }
});

function emptyRoute(): ActivatedRouteSnapshot {
  return { data: {} } as ActivatedRouteSnapshot;
}

function state(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}
