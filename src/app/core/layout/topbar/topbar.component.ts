import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;

  readonly navigationExpanded = input(false);
  readonly navigationToggle = output<void>();

  focusMenuButton(): void {
    this.menuButton?.nativeElement.focus();
  }
}
