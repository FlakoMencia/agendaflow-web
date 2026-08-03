import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface ModulePageData {
  readonly title: string;
  readonly description: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly icon: string;
}

@Component({
  selector: 'app-module-placeholder-page',
  imports: [EmptyStateComponent, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './module-placeholder-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulePlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly page = this.route.snapshot.data['page'] as ModulePageData;
  protected readonly breadcrumbs = ['AgendaFlow', this.page.title] as const;
}
