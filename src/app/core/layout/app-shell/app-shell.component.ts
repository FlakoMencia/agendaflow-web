import { ChangeDetectionStrategy, Component, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageContainerComponent } from '../page-container/page-container.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, PageContainerComponent, SidebarComponent, TopbarComponent],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  @ViewChild(TopbarComponent) private topbar?: TopbarComponent;
  @ViewChild(SidebarComponent) private sidebar?: SidebarComponent;

  protected readonly navigationOpen = signal(false);

  protected toggleNavigation(): void {
    const willOpen = !this.navigationOpen();
    this.navigationOpen.set(willOpen);
    queueMicrotask(() => {
      if (willOpen) {
        this.sidebar?.focusFirstLink();
      } else {
        this.topbar?.focusMenuButton();
      }
    });
  }

  protected closeNavigation(): void {
    if (!this.navigationOpen()) {
      return;
    }

    this.navigationOpen.set(false);
    queueMicrotask(() => this.topbar?.focusMenuButton());
  }

  protected handleEscape(): void {
    this.closeNavigation();
  }
}
