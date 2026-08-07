import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthSessionService } from '../../security/auth-session.service';

@Component({
  selector: 'app-access-denied-page',
  imports: [RouterLink],
  templateUrl: './access-denied-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPageComponent {
  private readonly auth = inject(AuthSessionService);
  readonly returnRoute = this.auth.preferredAuthenticatedRoute();
}
