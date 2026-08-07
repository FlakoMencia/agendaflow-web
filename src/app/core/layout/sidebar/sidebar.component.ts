import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Permission } from '../../security/auth.models';
import { AuthSessionService } from '../../security/auth-session.service';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly permissions?: readonly Permission[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @ViewChild('firstLink') private firstLink?: ElementRef<HTMLAnchorElement>;
  private readonly auth = inject(AuthSessionService);

  readonly open = input(false);
  readonly closeRequested = output<void>();
  readonly navigationSelected = output<void>();

  protected readonly navigationItems = computed<readonly NavigationItem[]>(() => {
    const organizationId = this.auth.activeOrganization()?.id;
    const items: readonly NavigationItem[] = [
      { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
      {
        label: 'Organizations',
        icon: 'pi pi-building',
        route: '/organizations',
        permissions: ['ORGANIZATION_VIEW'],
      },
      {
        label: 'Branches',
        icon: 'pi pi-map-marker',
        route: organizationId ? `/organizations/${organizationId}/branches` : '/branches',
        permissions: ['BRANCHES_VIEW'],
      },
      {
        label: 'Appointments',
        icon: 'pi pi-calendar',
        route: '/appointments',
        permissions: ['APPOINTMENTS_VIEW'],
      },
      {
        label: 'Customers',
        icon: 'pi pi-users',
        route: '/customers',
        permissions: ['CUSTOMERS_VIEW'],
      },
      {
        label: 'Specialists',
        icon: 'pi pi-id-card',
        route: '/specialists',
        permissions: ['SPECIALISTS_VIEW'],
      },
      {
        label: 'Services',
        icon: 'pi pi-briefcase',
        route: '/services',
        permissions: ['SERVICES_VIEW'],
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        route: '/settings',
        permissions: ['ORGANIZATION_UPDATE', 'USERS_VIEW', 'ROLES_VIEW'],
      },
    ];

    return items.filter(
      (item) => !item.permissions || this.auth.hasAnyPermission(item.permissions),
    );
  });
  protected readonly hasBusinessModules = computed(() => this.navigationItems().length > 1);

  focusFirstLink(): void {
    this.firstLink?.nativeElement.focus();
  }
}
