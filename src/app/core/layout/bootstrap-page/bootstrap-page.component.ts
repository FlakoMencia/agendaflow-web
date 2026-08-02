import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-bootstrap-page',
  imports: [ButtonModule, CardModule, DividerModule, TagModule],
  templateUrl: './bootstrap-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootstrapPageComponent {}
