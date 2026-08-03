import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let emptyStateSequence = 0;

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input.required<string>();

  protected readonly titleId = `empty-state-title-${emptyStateSequence++}`;
}
