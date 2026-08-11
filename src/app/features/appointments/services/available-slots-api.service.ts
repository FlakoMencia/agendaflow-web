import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { AvailableSlotsRequest, AvailableSlotsResponse } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AvailableSlotsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(organizationId: number, request: AvailableSlotsRequest): Observable<AvailableSlotsResponse> {
    let params = new HttpParams()
      .set('branchId', request.branchId)
      .set('serviceId', request.serviceId)
      .set('date', request.date);
    if (request.specialistId !== undefined)
      params = params.set('specialistId', request.specialistId);
    return this.http.get<AvailableSlotsResponse>(
      `${this.apiConfig.baseUrl}/organizations/${organizationId}/availability/slots`,
      { params },
    );
  }
}
