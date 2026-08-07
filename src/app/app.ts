import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthSessionService } from './core/security/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly auth = inject(AuthSessionService);

  constructor() {
    void this.auth.initialize();
  }
}
