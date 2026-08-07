import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthSessionStub } from '../../../testing/auth-fixtures';
import { AuthSessionService } from '../../security/auth-session.service';
import { AccessDeniedPageComponent } from './access-denied-page.component';

describe('AccessDeniedPageComponent', () => {
  it('renders a safe permission message without exposing backend details', () => {
    TestBed.configureTestingModule({
      imports: [AccessDeniedPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthSessionService, useValue: new AuthSessionStub([], []) },
      ],
    });
    const fixture = TestBed.createComponent(AccessDeniedPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Access denied');
    expect(fixture.nativeElement.textContent).toContain('do not have permission');
  });
});
