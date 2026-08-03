import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @ViewChild('firstLink') private firstLink?: ElementRef<HTMLAnchorElement>;

  readonly open = input(false);
  readonly closeRequested = output<void>();
  readonly navigationSelected = output<void>();

  protected readonly navigationItems: readonly NavigationItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Organizations', icon: 'pi pi-building', route: '/organizations' },
    { label: 'Appointments', icon: 'pi pi-calendar', route: '/appointments' },
    { label: 'Customers', icon: 'pi pi-users', route: '/customers' },
    { label: 'Specialists', icon: 'pi pi-id-card', route: '/specialists' },
    { label: 'Services', icon: 'pi pi-briefcase', route: '/services' },
    { label: 'Branches', icon: 'pi pi-map-marker', route: '/branches' },
    { label: 'Settings', icon: 'pi pi-cog', route: '/settings' },
  ];

  focusFirstLink(): void {
    this.firstLink?.nativeElement.focus();
  }
}
