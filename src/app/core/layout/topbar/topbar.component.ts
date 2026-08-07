import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthSessionService } from '../../security/auth-session.service';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);

  readonly navigationExpanded = input(false);
  readonly navigationToggle = output<void>();
  protected readonly accountMenuOpen = signal(false);
  protected readonly user = this.auth.user;
  protected readonly activeOrganization = this.auth.activeOrganization;
  protected readonly displayName = this.auth.displayName;

  focusMenuButton(): void {
    this.menuButton?.nativeElement.focus();
  }

  protected toggleAccountMenu(): void {
    this.accountMenuOpen.update((open) => !open);
  }

  protected closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  protected signOut(): void {
    this.closeAccountMenu();
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
