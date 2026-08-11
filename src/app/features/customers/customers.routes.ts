import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/security/auth.guards';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    title: 'Customers | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['CUSTOMERS_VIEW'] },
    loadComponent: () =>
      import('./pages/customer-list-page/customer-list-page.component').then(
        ({ CustomerListPageComponent }) => CustomerListPageComponent,
      ),
  },
  {
    path: 'new',
    title: 'New customer | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['CUSTOMERS_CREATE'] },
    loadComponent: () =>
      import('./pages/customer-form-page/customer-form-page.component').then(
        ({ CustomerFormPageComponent }) => CustomerFormPageComponent,
      ),
  },
  {
    path: ':customerId/edit',
    title: 'Edit customer | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['CUSTOMERS_UPDATE'] },
    loadComponent: () =>
      import('./pages/customer-form-page/customer-form-page.component').then(
        ({ CustomerFormPageComponent }) => CustomerFormPageComponent,
      ),
  },
  {
    path: ':customerId',
    title: 'Customer details | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['CUSTOMERS_VIEW'] },
    loadComponent: () =>
      import('./pages/customer-detail-page/customer-detail-page.component').then(
        ({ CustomerDetailPageComponent }) => CustomerDetailPageComponent,
      ),
  },
];
