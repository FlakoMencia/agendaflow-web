import { Routes } from '@angular/router';

import {
  authChildGuard,
  authGuard,
  guestGuard,
  permissionGuard,
} from './core/security/auth.guards';
import { Permission } from './core/security/auth.models';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in | AgendaFlow',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        ({ LoginPageComponent }) => LoginPageComponent,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell.component').then(
        ({ AppShellComponent }) => AppShellComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard | AgendaFlow',
        data: {
          page: {
            title: 'Dashboard',
            description: 'Punto de entrada para la futura experiencia operativa de AgendaFlow.',
            emptyTitle: 'Dashboard en preparación',
            emptyDescription:
              'Los indicadores y accesos operativos se incorporarán en fases posteriores.',
            icon: 'pi pi-home',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: 'organizations',
        title: 'Organizations | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['ORGANIZATION_VIEW'] },
        loadComponent: () =>
          import('./features/organizations/pages/organization-list-page/organization-list-page.component').then(
            ({ OrganizationListPageComponent }) => OrganizationListPageComponent,
          ),
      },
      {
        path: 'organizations/new',
        title: 'New organization | AgendaFlow',
        canActivate: [permissionGuard],
        data: { roles: ['PLATFORM_ADMIN'] },
        loadComponent: () =>
          import('./features/organizations/pages/organization-form-page/organization-form-page.component').then(
            ({ OrganizationFormPageComponent }) => OrganizationFormPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId',
        title: 'Organization details | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['ORGANIZATION_VIEW'] },
        loadComponent: () =>
          import('./features/organizations/pages/organization-detail-page/organization-detail-page.component').then(
            ({ OrganizationDetailPageComponent }) => OrganizationDetailPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/edit',
        title: 'Edit organization | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['ORGANIZATION_UPDATE'] },
        loadComponent: () =>
          import('./features/organizations/pages/organization-form-page/organization-form-page.component').then(
            ({ OrganizationFormPageComponent }) => OrganizationFormPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/branches',
        title: 'Branches | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['BRANCHES_VIEW'] },
        loadComponent: () =>
          import('./features/branches/pages/branch-list-page/branch-list-page.component').then(
            ({ BranchListPageComponent }) => BranchListPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/branches/new',
        title: 'New branch | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['BRANCHES_MANAGE'] },
        loadComponent: () =>
          import('./features/branches/pages/branch-form-page/branch-form-page.component').then(
            ({ BranchFormPageComponent }) => BranchFormPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/branches/:branchId/edit',
        title: 'Edit branch | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['BRANCHES_MANAGE'] },
        loadComponent: () =>
          import('./features/branches/pages/branch-form-page/branch-form-page.component').then(
            ({ BranchFormPageComponent }) => BranchFormPageComponent,
          ),
      },
      moduleRoute(
        'appointments',
        'Appointments',
        'APPOINTMENTS_VIEW',
        'Espacio reservado para la gestión futura de citas.',
        'Gestión de citas aún no implementada',
        'El calendario, las reservas y los estados de citas llegarán en fases posteriores.',
        'pi pi-calendar',
      ),
      moduleRoute(
        'customers',
        'Customers',
        'CUSTOMERS_VIEW',
        'Espacio reservado para la administración futura de clientes.',
        'Clientes aún no implementados',
        'Los perfiles, historiales y acciones sobre clientes se agregarán más adelante.',
        'pi pi-users',
      ),
      {
        path: 'services',
        title: 'Services | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SERVICES_VIEW'] },
        loadComponent: () =>
          import('./features/services/pages/service-list-page/service-list-page.component').then(
            ({ ServiceListPageComponent }) => ServiceListPageComponent,
          ),
      },
      {
        path: 'services/new',
        title: 'New service | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SERVICES_MANAGE'] },
        loadComponent: () =>
          import('./features/services/pages/service-form-page/service-form-page.component').then(
            ({ ServiceFormPageComponent }) => ServiceFormPageComponent,
          ),
      },
      {
        path: 'services/categories',
        title: 'Service categories | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SERVICES_VIEW'] },
        loadComponent: () =>
          import('./features/services/pages/service-categories-page/service-categories-page.component').then(
            ({ ServiceCategoriesPageComponent }) => ServiceCategoriesPageComponent,
          ),
      },
      {
        path: 'services/:serviceId/edit',
        title: 'Edit service | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SERVICES_MANAGE'] },
        loadComponent: () =>
          import('./features/services/pages/service-form-page/service-form-page.component').then(
            ({ ServiceFormPageComponent }) => ServiceFormPageComponent,
          ),
      },
      {
        path: 'services/:serviceId',
        title: 'Service details | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SERVICES_VIEW'] },
        loadComponent: () =>
          import('./features/services/pages/service-detail-page/service-detail-page.component').then(
            ({ ServiceDetailPageComponent }) => ServiceDetailPageComponent,
          ),
      },
      {
        path: 'specialists',
        title: 'Specialists | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SPECIALISTS_VIEW'] },
        loadComponent: () =>
          import('./features/specialists/pages/specialist-list-page/specialist-list-page.component').then(
            ({ SpecialistListPageComponent }) => SpecialistListPageComponent,
          ),
      },
      {
        path: 'specialists/new',
        title: 'New specialist | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SPECIALISTS_MANAGE'] },
        loadComponent: () =>
          import('./features/specialists/pages/specialist-form-page/specialist-form-page.component').then(
            ({ SpecialistFormPageComponent }) => SpecialistFormPageComponent,
          ),
      },
      {
        path: 'specialists/:specialistId/edit',
        title: 'Edit specialist | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SPECIALISTS_MANAGE'] },
        loadComponent: () =>
          import('./features/specialists/pages/specialist-form-page/specialist-form-page.component').then(
            ({ SpecialistFormPageComponent }) => SpecialistFormPageComponent,
          ),
      },
      {
        path: 'specialists/:specialistId/availability',
        title: 'Specialist availability | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SCHEDULE_VIEW'] },
        loadComponent: () =>
          import(
            './features/specialists/pages/specialist-availability-page/specialist-availability-page.component'
          ).then(({ SpecialistAvailabilityPageComponent }) => SpecialistAvailabilityPageComponent),
      },
      {
        path: 'specialists/:specialistId',
        title: 'Specialist details | AgendaFlow',
        canActivate: [permissionGuard],
        data: { permissions: ['SPECIALISTS_VIEW'] },
        loadComponent: () =>
          import(
            './features/specialists/pages/specialist-detail-page/specialist-detail-page.component'
          ).then(({ SpecialistDetailPageComponent }) => SpecialistDetailPageComponent),
      },
      moduleRoute(
        'branches',
        'Branches',
        'BRANCHES_VIEW',
        'Acceso técnico al futuro módulo global de sucursales.',
        'Use la sucursal de su organización activa',
        'La gestión disponible permanece vinculada a la organización activa.',
        'pi pi-building',
      ),
      {
        ...moduleRoute(
          'settings',
          'Settings',
          'ORGANIZATION_UPDATE',
          'Espacio reservado para la configuración futura de la plataforma.',
          'Configuración aún no implementada',
          'Las preferencias de organización y seguridad se definirán en fases posteriores.',
          'pi pi-cog',
        ),
        data: {
          permissions: ['ORGANIZATION_UPDATE', 'USERS_VIEW', 'ROLES_VIEW'],
          page: {
            title: 'Settings',
            description: 'Espacio reservado para la configuración futura de la plataforma.',
            emptyTitle: 'Configuración aún no implementada',
            emptyDescription:
              'Las preferencias de organización y seguridad se definirán en fases posteriores.',
            icon: 'pi pi-cog',
          },
        },
      },
      {
        path: 'access-denied',
        title: 'Access denied | AgendaFlow',
        loadComponent: () =>
          import('./core/layout/access-denied-page/access-denied-page.component').then(
            ({ AccessDeniedPageComponent }) => AccessDeniedPageComponent,
          ),
      },
    ],
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

function moduleRoute(
  path: string,
  title: string,
  permission: Permission,
  description: string,
  emptyTitle: string,
  emptyDescription: string,
  icon: string,
) {
  return {
    path,
    title: `${title} | AgendaFlow`,
    canActivate: [permissionGuard],
    data: {
      permissions: [permission],
      page: { title, description, emptyTitle, emptyDescription, icon },
    },
    loadComponent: loadModulePlaceholder,
  } satisfies Routes[number];
}

function loadModulePlaceholder() {
  return import('./core/layout/module-placeholder-page/module-placeholder-page.component').then(
    ({ ModulePlaceholderPageComponent }) => ModulePlaceholderPageComponent,
  );
}
