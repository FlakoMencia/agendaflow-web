import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/security/auth.guards';

export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    title: 'Appointments | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['APPOINTMENTS_VIEW'] },
    loadComponent: () =>
      import('./pages/appointment-list-page/appointment-list-page.component').then(
        ({ AppointmentListPageComponent }) => AppointmentListPageComponent,
      ),
  },
  {
    path: 'new',
    title: 'Book appointment | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['APPOINTMENTS_CREATE'] },
    loadComponent: () =>
      import('./pages/appointment-booking-page/appointment-booking-page.component').then(
        ({ AppointmentBookingPageComponent }) => AppointmentBookingPageComponent,
      ),
  },
  {
    path: ':appointmentId/reschedule',
    title: 'Reschedule appointment | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['APPOINTMENTS_UPDATE'] },
    loadComponent: () =>
      import('./pages/appointment-reschedule-page/appointment-reschedule-page.component').then(
        ({ AppointmentReschedulePageComponent }) => AppointmentReschedulePageComponent,
      ),
  },
  {
    path: ':appointmentId',
    title: 'Appointment details | AgendaFlow',
    canActivate: [permissionGuard],
    data: { permissions: ['APPOINTMENTS_VIEW'] },
    loadComponent: () =>
      import('./pages/appointment-detail-page/appointment-detail-page.component').then(
        ({ AppointmentDetailPageComponent }) => AppointmentDetailPageComponent,
      ),
  },
];
