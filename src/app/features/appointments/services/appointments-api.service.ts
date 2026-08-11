import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageResponse } from '../../../core/http/page-response.model';
import {
  Appointment,
  AppointmentHistoryEntry,
  AppointmentListRequest,
  CancelAppointmentRequest,
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(
    organizationId: number,
    request: AppointmentListRequest = {},
  ): Observable<PageResponse<Appointment>> {
    let params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'startsAt,asc');
    if (request.from) params = params.set('from', request.from);
    if (request.to) params = params.set('to', request.to);
    if (request.branchId !== undefined) params = params.set('branchId', request.branchId);
    if (request.specialistId !== undefined)
      params = params.set('specialistId', request.specialistId);
    if (request.customerId !== undefined) params = params.set('customerId', request.customerId);
    if (request.status) params = params.set('status', request.status);
    return this.http.get<PageResponse<Appointment>>(this.resourceUrl(organizationId), { params });
  }

  get(organizationId: number, appointmentId: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.resourceUrl(organizationId)}/${appointmentId}`);
  }

  create(organizationId: number, request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.resourceUrl(organizationId), request);
  }

  reschedule(
    organizationId: number,
    appointmentId: number,
    request: RescheduleAppointmentRequest,
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.resourceUrl(organizationId)}/${appointmentId}/reschedule`,
      request,
    );
  }

  cancel(
    organizationId: number,
    appointmentId: number,
    request: CancelAppointmentRequest,
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.resourceUrl(organizationId)}/${appointmentId}/cancel`,
      request,
    );
  }

  confirm(organizationId: number, appointmentId: number): Observable<Appointment> {
    return this.lifecycle(organizationId, appointmentId, 'confirm');
  }

  checkIn(organizationId: number, appointmentId: number): Observable<Appointment> {
    return this.lifecycle(organizationId, appointmentId, 'check-in');
  }

  start(organizationId: number, appointmentId: number): Observable<Appointment> {
    return this.lifecycle(organizationId, appointmentId, 'start');
  }

  complete(organizationId: number, appointmentId: number): Observable<Appointment> {
    return this.lifecycle(organizationId, appointmentId, 'complete');
  }

  markNoShow(organizationId: number, appointmentId: number): Observable<Appointment> {
    return this.lifecycle(organizationId, appointmentId, 'no-show');
  }

  history(
    organizationId: number,
    appointmentId: number,
  ): Observable<readonly AppointmentHistoryEntry[]> {
    return this.http.get<readonly AppointmentHistoryEntry[]>(
      `${this.resourceUrl(organizationId)}/${appointmentId}/history`,
    );
  }

  private resourceUrl(organizationId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/appointments`;
  }

  private lifecycle(
    organizationId: number,
    appointmentId: number,
    action: 'confirm' | 'check-in' | 'start' | 'complete' | 'no-show',
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.resourceUrl(organizationId)}/${appointmentId}/${action}`,
      null,
    );
  }
}
