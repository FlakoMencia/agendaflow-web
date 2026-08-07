import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthSessionStub } from '../../../testing/auth-fixtures';
import { AuthSessionService } from '../../security/auth-session.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  it('shows only navigation allowed by the current permissions', () => {
    const auth = new AuthSessionStub([], ['ORGANIZATION_VIEW']);
    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([]), { provide: AuthSessionService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Dashboard');
    expect(text).toContain('Organizations');
    expect(text).not.toContain('Branches');
    expect(text).not.toContain('Appointments');
    expect(text).not.toContain('Settings');
  });

  it('shows a useful state when the account has no business modules', () => {
    const auth = new AuthSessionStub([], []);
    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([]), { provide: AuthSessionService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No modules are assigned');
  });
});
