import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, tap, throwError, timeout } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import {
  AuthSessionState,
  CurrentSession,
  LoginRequest,
  LoginResponse,
  Permission,
  Role,
} from './auth.models';
import { AUTH_SESSION_STORAGE, AUTH_TOKEN_STORAGE_KEY } from './auth-session.storage';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly storage = inject(AUTH_SESSION_STORAGE);
  private readonly authUrl = `${this.apiConfig.baseUrl}/auth`;

  private readonly stateSignal = signal<AuthSessionState>('initial');
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly sessionSignal = signal<CurrentSession | null>(null);
  private initialization: Promise<boolean> | null = null;

  readonly state = this.stateSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly session = this.sessionSignal.asReadonly();
  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly activeOrganization = computed(() => this.sessionSignal()?.activeOrganization ?? null);
  readonly roles = computed(() => this.sessionSignal()?.roles ?? []);
  readonly permissions = computed(() => this.sessionSignal()?.permissions ?? []);
  readonly isInitializing = computed(() => this.stateSignal() === 'initial');
  readonly isAuthenticating = computed(() => this.stateSignal() === 'authenticating');
  readonly isAuthenticated = computed(
    () => this.stateSignal() === 'authenticated' && this.sessionSignal() !== null,
  );
  readonly isPlatformAdmin = computed(() => this.roles().includes('PLATFORM_ADMIN'));
  readonly displayName = computed(() => {
    const user = this.user();
    if (!user) return '';
    return [user.firstName, user.middleName, user.lastName, user.secondLastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ');
  });

  initialize(): Promise<boolean> {
    if (this.initialization) return this.initialization;

    const storedToken = this.storage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!storedToken) {
      this.stateSignal.set('unauthenticated');
      this.initialization = Promise.resolve(false);
      return this.initialization;
    }

    this.accessTokenSignal.set(storedToken);
    this.initialization = firstValueFrom(
      this.http.get<CurrentSession>(`${this.authUrl}/me`).pipe(
        timeout({ first: 10_000 }),
        tap((session) => this.establishSession(session)),
        map(() => true),
        catchError(() => {
          this.clearSession();
          return of(false);
        }),
      ),
    );
    return this.initialization;
  }

  login(request: LoginRequest): Observable<CurrentSession> {
    if (this.stateSignal() === 'authenticating') {
      return throwError(() => new Error('Authentication is already in progress.'));
    }

    this.stateSignal.set('authenticating');
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, request).pipe(
      tap((response) => {
        this.storage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken);
        this.accessTokenSignal.set(response.accessToken);
        this.establishSession(toCurrentSession(response));
        this.initialization = Promise.resolve(true);
      }),
      map(toCurrentSession),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    this.storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    this.accessTokenSignal.set(null);
    this.sessionSignal.set(null);
    this.stateSignal.set('unauthenticated');
    this.initialization = Promise.resolve(false);
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

  private establishSession(session: CurrentSession): void {
    this.sessionSignal.set({
      ...session,
      roles: [...session.roles],
      permissions: [...session.permissions],
    });
    this.stateSignal.set('authenticated');
  }
}

function toCurrentSession(response: LoginResponse): CurrentSession {
  return {
    membershipId: response.membershipId,
    user: response.user,
    activeOrganization: response.activeOrganization,
    roles: [...response.roles],
    permissions: [...response.permissions],
  };
}
