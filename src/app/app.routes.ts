import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell.component').then(
        ({ AppShellComponent }) => AppShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
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
        loadComponent: () =>
          import('./features/organizations/pages/organization-list-page/organization-list-page.component').then(
            ({ OrganizationListPageComponent }) => OrganizationListPageComponent,
          ),
      },
      {
        path: 'organizations/new',
        title: 'New organization | AgendaFlow',
        loadComponent: () =>
          import('./features/organizations/pages/organization-form-page/organization-form-page.component').then(
            ({ OrganizationFormPageComponent }) => OrganizationFormPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId',
        title: 'Organization details | AgendaFlow',
        loadComponent: () =>
          import('./features/organizations/pages/organization-detail-page/organization-detail-page.component').then(
            ({ OrganizationDetailPageComponent }) => OrganizationDetailPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/edit',
        title: 'Edit organization | AgendaFlow',
        loadComponent: () =>
          import('./features/organizations/pages/organization-form-page/organization-form-page.component').then(
            ({ OrganizationFormPageComponent }) => OrganizationFormPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/branches',
        title: 'Branches | AgendaFlow',
        loadComponent: () =>
          import('./features/branches/pages/branch-list-page/branch-list-page.component').then(
            ({ BranchListPageComponent }) => BranchListPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/branches/new',
        title: 'New branch | AgendaFlow',
        loadComponent: () =>
          import('./features/branches/pages/branch-form-page/branch-form-page.component').then(
            ({ BranchFormPageComponent }) => BranchFormPageComponent,
          ),
      },
      {
        path: 'organizations/:organizationId/branches/:branchId/edit',
        title: 'Edit branch | AgendaFlow',
        loadComponent: () =>
          import('./features/branches/pages/branch-form-page/branch-form-page.component').then(
            ({ BranchFormPageComponent }) => BranchFormPageComponent,
          ),
      },
      {
        path: 'appointments',
        title: 'Appointments | AgendaFlow',
        data: {
          page: {
            title: 'Appointments',
            description: 'Espacio reservado para la gestión futura de citas.',
            emptyTitle: 'Gestión de citas aún no implementada',
            emptyDescription:
              'El calendario, las reservas y los estados de citas llegarán en fases posteriores.',
            icon: 'pi pi-calendar',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: 'customers',
        title: 'Customers | AgendaFlow',
        data: {
          page: {
            title: 'Customers',
            description: 'Espacio reservado para la administración futura de clientes.',
            emptyTitle: 'Clientes aún no implementados',
            emptyDescription:
              'Los perfiles, historiales y acciones sobre clientes se agregarán más adelante.',
            icon: 'pi pi-users',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: 'specialists',
        title: 'Specialists | AgendaFlow',
        data: {
          page: {
            title: 'Specialists',
            description: 'Espacio reservado para especialistas y sus asignaciones.',
            emptyTitle: 'Especialistas aún no implementados',
            emptyDescription:
              'Perfiles profesionales, servicios y disponibilidad se incorporarán después.',
            icon: 'pi pi-id-card',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: 'services',
        title: 'Services | AgendaFlow',
        data: {
          page: {
            title: 'Services',
            description: 'Espacio reservado para el catálogo futuro de servicios.',
            emptyTitle: 'Catálogo de servicios aún no implementado',
            emptyDescription:
              'La definición de servicios, duración y disponibilidad llegará en otra fase.',
            icon: 'pi pi-briefcase',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: 'branches',
        title: 'Branches | AgendaFlow',
        data: {
          page: {
            title: 'Branches',
            description: 'Espacio reservado para la administración futura de sucursales.',
            emptyTitle: 'Sucursales aún no implementadas',
            emptyDescription:
              'La configuración de ubicaciones y horarios se incorporará posteriormente.',
            icon: 'pi pi-building',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: 'settings',
        title: 'Settings | AgendaFlow',
        data: {
          page: {
            title: 'Settings',
            description: 'Espacio reservado para la configuración futura de la plataforma.',
            emptyTitle: 'Configuración aún no implementada',
            emptyDescription:
              'Las preferencias de organización y seguridad se definirán en fases posteriores.',
            icon: 'pi pi-cog',
          },
        },
        loadComponent: loadModulePlaceholder,
      },
      {
        path: '**',
        title: 'Página no encontrada | AgendaFlow',
        loadComponent: () =>
          import('./core/layout/not-found-page/not-found-page.component').then(
            ({ NotFoundPageComponent }) => NotFoundPageComponent,
          ),
      },
    ],
  },
];

function loadModulePlaceholder() {
  return import('./core/layout/module-placeholder-page/module-placeholder-page.component').then(
    ({ ModulePlaceholderPageComponent }) => ModulePlaceholderPageComponent,
  );
}
