import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { API_CONFIG } from '../config/api.config';
import { AuthSessionStub } from '../../testing/auth-fixtures';
import { AuthSessionService } from './auth-session.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let auth: AuthSessionStub;
  let router: RouterStub;

  beforeEach(() => {
    auth = new AuthSessionStub();
    router = new RouterStub();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
        { provide: AuthSessionService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('adds Bearer to AgendaFlow API requests and preserves existing headers', () => {
    client
      .get('http://localhost:8080/api/v1/organizations', {
        headers: { 'X-Request-Context': 'test' },
      })
      .subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/organizations');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(request.request.headers.get('X-Request-Context')).toBe('test');
    request.flush({});
  });

  it('does not add Bearer to the login endpoint', () => {
    client.post('http://localhost:8080/api/v1/auth/login', {}).subscribe();
    const request = http.expectOne('http://localhost:8080/api/v1/auth/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('does not send the token to an external URL', () => {
    client.get('http://localhost:8081/api/v1/notification-requests').subscribe();
    const request = http.expectOne('http://localhost:8081/api/v1/notification-requests');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('clears the session and redirects once when an API request returns 401', () => {
    client.get('http://localhost:8080/api/v1/organizations').subscribe({ error: () => undefined });
    http
      .expectOne('http://localhost:8080/api/v1/organizations')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.clearSessionCalls).toBe(1);
    expect(router.navigations).toEqual([
      { commands: ['/login'], extras: { queryParams: { returnUrl: '/organizations' } } },
    ]);
  });

  it('does not create a redirect loop while already on login', () => {
    router.url = '/login';
    client.get('http://localhost:8080/api/v1/auth/me').subscribe({ error: () => undefined });
    http
      .expectOne('http://localhost:8080/api/v1/auth/me')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.clearSessionCalls).toBe(1);
    expect(router.navigations).toEqual([]);
  });

  it('redirects authenticated 403 responses to access denied', () => {
    client.get('http://localhost:8080/api/v1/organizations').subscribe({
      error: (error: HttpErrorResponse) => expect(error.status).toBe(403),
    });
    http
      .expectOne('http://localhost:8080/api/v1/organizations')
      .flush({}, { status: 403, statusText: 'Forbidden' });

    expect(router.navigations[0]?.commands).toEqual(['/access-denied']);
  });
});

class RouterStub {
  url = '/organizations';
  readonly navigations: Array<{ commands: unknown[]; extras?: unknown }> = [];

  navigate(commands: unknown[], extras?: unknown): Promise<boolean> {
    this.navigations.push({ commands, extras });
    return Promise.resolve(true);
  }
}
