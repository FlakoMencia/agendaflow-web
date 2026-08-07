import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { CURRENT_SESSION_FIXTURE, LOGIN_RESPONSE_FIXTURE } from '../../testing/auth-fixtures';
import { AUTH_TOKEN_STORAGE_KEY } from './auth-session.storage';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
      ],
    });
    service = TestBed.inject(AuthSessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('logs in, stores the token and exposes roles and permissions', async () => {
    const result = firstValueFrom(
      service.login({ email: 'admin@example.com', password: 'correct', organizationId: 42 }),
    );
    const request = http.expectOne('http://localhost:8080/api/v1/auth/login');
    expect(request.request.body).toEqual({
      email: 'admin@example.com',
      password: 'correct',
      organizationId: 42,
    });
    request.flush(LOGIN_RESPONSE_FIXTURE);

    await expect(result).resolves.toEqual(CURRENT_SESSION_FIXTURE);
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(LOGIN_RESPONSE_FIXTURE.accessToken);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasRole('PLATFORM_ADMIN')).toBe(true);
    expect(service.hasPermission('BRANCHES_MANAGE')).toBe(true);
  });

  it('keeps a failed login unauthenticated and does not store credentials', async () => {
    const result = firstValueFrom(
      service.login({ email: 'unknown@example.com', password: 'wrong', organizationId: 42 }),
    );
    http
      .expectOne('http://localhost:8080/api/v1/auth/login')
      .flush({ code: 'INVALID_CREDENTIALS' }, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('restores a stored session through auth/me', async () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'restored-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
      ],
    });
    service = TestBed.inject(AuthSessionService);
    http = TestBed.inject(HttpTestingController);

    const restored = service.initialize();
    http.expectOne('http://localhost:8080/api/v1/auth/me').flush(CURRENT_SESSION_FIXTURE);

    await expect(restored).resolves.toBe(true);
    expect(service.user()?.email).toBe('admin@example.com');
    expect(service.activeOrganization()?.id).toBe(42);
  });

  it('clears an invalid stored session when auth/me responds 401', async () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'expired-token');
    const restored = service.initialize();
    http
      .expectOne('http://localhost:8080/api/v1/auth/me')
      .flush({ code: 'TOKEN_EXPIRED' }, { status: 401, statusText: 'Unauthorized' });

    await expect(restored).resolves.toBe(false);
    expect(service.accessToken()).toBeNull();
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('performs a local logout without an HTTP request', async () => {
    const login = firstValueFrom(
      service.login({ email: 'admin@example.com', password: 'correct', organizationId: 42 }),
    );
    http.expectOne('http://localhost:8080/api/v1/auth/login').flush(LOGIN_RESPONSE_FIXTURE);
    await login;

    service.logout();

    expect(service.state()).toBe('unauthenticated');
    expect(service.session()).toBeNull();
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
