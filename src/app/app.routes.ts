import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'AgendaFlow — Bootstrap',
    loadComponent: () =>
      import('./core/layout/bootstrap-page/bootstrap-page.component').then(
        ({ BootstrapPageComponent }) => BootstrapPageComponent,
      ),
  },
  {
    path: '**',
    title: 'Página no encontrada | AgendaFlow',
    loadComponent: () =>
      import('./core/layout/not-found-page/not-found-page.component').then(
        ({ NotFoundPageComponent }) => NotFoundPageComponent,
      ),
  },
];
