import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { AuthSessionStub } from '../../../testing/auth-fixtures';
import { AuthSessionService } from '../../security/auth-session.service';
import { TopbarComponent } from './topbar.component';

describe('TopbarComponent', () => {
  it('renders the user and active organization and performs local sign out', async () => {
    const auth = new AuthSessionStub();
    TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideRouter([{ path: 'login', component: TestRouteComponent }]),
        { provide: AuthSessionService, useValue: auth },
      ],
    });
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('AgendaFlow Test');

    fixture.nativeElement.querySelector('.account-menu__trigger').click();
    fixture.detectChanges();
    const signOut = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
    signOut.click();
    await fixture.whenStable();

    expect(auth.logoutCalls).toBe(1);
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});

@Component({ template: '', standalone: true })
class TestRouteComponent {}
