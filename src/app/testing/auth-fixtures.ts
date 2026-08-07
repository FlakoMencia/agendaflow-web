import { computed, signal } from '@angular/core';

import { CurrentSession, LoginResponse, Permission, Role } from '../core/security/auth.models';

export const CURRENT_SESSION_FIXTURE: CurrentSession = {
  membershipId: 12,
  user: {
    id: 5,
    email: 'admin@example.com',
    firstName: 'Ada',
    middleName: null,
    lastName: 'Lovelace',
    secondLastName: null,
    preferredLanguage: 'en-US',
  },
  activeOrganization: {
    id: 42,
    legalName: 'AgendaFlow Test Organization',
    tradeName: 'AgendaFlow Test',
    timezone: 'America/New_York',
    languageCode: 'en-US',
    status: 'ACTIVE',
  },
  roles: ['PLATFORM_ADMIN'],
  permissions: ['ORGANIZATION_VIEW', 'ORGANIZATION_UPDATE', 'BRANCHES_VIEW', 'BRANCHES_MANAGE'],
};

export const LOGIN_RESPONSE_FIXTURE: LoginResponse = {
  accessToken: 'header.payload.signature',
  tokenType: 'Bearer',
  expiresIn: 1800,
  ...CURRENT_SESSION_FIXTURE,
};

export class AuthSessionStub {
  private readonly sessionValue = signal<CurrentSession | null>(CURRENT_SESSION_FIXTURE);
  readonly session = this.sessionValue.asReadonly();
  readonly user = computed(() => this.sessionValue()?.user ?? null);
  readonly activeOrganization = computed(() => this.sessionValue()?.activeOrganization ?? null);
  readonly roles = computed(() => this.sessionValue()?.roles ?? []);
  readonly permissions = computed(() => this.sessionValue()?.permissions ?? []);
  readonly accessToken = signal<string | null>('test-token');
  readonly isInitializing = signal(false);
  readonly isAuthenticated = computed(() => this.sessionValue() !== null);
  readonly isPlatformAdmin = computed(() => this.roles().includes('PLATFORM_ADMIN'));
  readonly displayName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  logoutCalls = 0;
  clearSessionCalls = 0;

  constructor(
    roles: readonly Role[] = CURRENT_SESSION_FIXTURE.roles,
    permissions: readonly Permission[] = CURRENT_SESSION_FIXTURE.permissions,
  ) {
    this.setAuthorization(roles, permissions);
  }

  initialize(): Promise<boolean> {
    return Promise.resolve(this.isAuthenticated());
  }

  hasPermission(permission: Permission): boolean {
    return this.isPlatformAdmin() || this.permissions().includes(permission);
  }

  hasAnyPermission(permissions: readonly Permission[]): boolean {
    return (
      this.isPlatformAdmin() || permissions.some((permission) => this.hasPermission(permission))
    );
  }

  hasRole(role: Role): boolean {
    return this.roles().includes(role);
  }

  preferredAuthenticatedRoute(): string {
    return this.hasPermission('ORGANIZATION_VIEW') ? '/organizations' : '/dashboard';
  }

  logout(): void {
    this.logoutCalls += 1;
    this.setUnauthenticated();
  }

  clearSession(): void {
    this.clearSessionCalls += 1;
    this.setUnauthenticated();
  }

  setAuthorization(roles: readonly Role[], permissions: readonly Permission[]): void {
    this.sessionValue.set({ ...CURRENT_SESSION_FIXTURE, roles, permissions });
  }

  setUnauthenticated(): void {
    this.sessionValue.set(null);
    this.accessToken.set(null);
  }
}
