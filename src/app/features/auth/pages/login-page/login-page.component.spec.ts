import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { API_CONFIG } from '../../../../core/config/api.config';
import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { LOGIN_RESPONSE_FIXTURE } from '../../../../testing/auth-fixtures';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'organizations', component: TestRouteComponent }]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:8080/api/v1' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('does not submit an invalid form and exposes accessible validation messages', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    http.expectNone('http://localhost:8080/api/v1/auth/login');
    expect(fixture.nativeElement.textContent).toContain('Enter a valid email address.');
    expect(fixture.nativeElement.textContent).toContain('Password is required.');
    expect(fixture.nativeElement.textContent).toContain('Enter a positive organization ID.');
  });

  it('prevents a double submit while authentication is pending', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'admin@example.com',
      password: 'correct',
      organizationId: 42,
    });

    component.submit();
    component.submit();

    const request = http.expectOne('http://localhost:8080/api/v1/auth/login');
    request.flush(LOGIN_RESPONSE_FIXTURE);
  });

  it('shows a generic invalid-credentials message and clears the password', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'person@example.com',
      password: 'incorrect',
      organizationId: 42,
    });

    component.submit();
    http
      .expectOne('http://localhost:8080/api/v1/auth/login')
      .flush(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.form.controls.password.value).toBe('');
    expect(fixture.nativeElement.textContent).toContain(
      'Email, password or organization ID is invalid.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Invalid credentials');
  });
});

@Component({ template: '', standalone: true })
class TestRouteComponent {}
