import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageRequest, PageResponse } from '../../../core/http/page-response.model';
import { AvailabilityRequest, AvailabilitySchedule, ScheduleBlock, ScheduleBlockRequest } from '../models/scheduling.model';

@Injectable({ providedIn: 'root' })
export class AvailabilityApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  listAvailability(organizationId: number, specialistId: number): Observable<readonly AvailabilitySchedule[]> {
    return this.http.get<readonly AvailabilitySchedule[]>(`${this.resourceUrl(organizationId, specialistId)}/availability`);
  }

  createAvailability(organizationId: number, specialistId: number, request: AvailabilityRequest): Observable<AvailabilitySchedule> {
    return this.http.post<AvailabilitySchedule>(`${this.resourceUrl(organizationId, specialistId)}/availability`, request);
  }

  updateAvailability(organizationId: number, specialistId: number, scheduleId: number, request: AvailabilityRequest): Observable<AvailabilitySchedule> {
    return this.http.put<AvailabilitySchedule>(`${this.resourceUrl(organizationId, specialistId)}/availability/${scheduleId}`, request);
  }

  listBlocks(organizationId: number, specialistId: number, request: PageRequest = {}): Observable<PageResponse<ScheduleBlock>> {
    const params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'startsAt,desc');
    return this.http.get<PageResponse<ScheduleBlock>>(`${this.resourceUrl(organizationId, specialistId)}/schedule-blocks`, { params });
  }

  getBlock(organizationId: number, specialistId: number, blockId: number): Observable<ScheduleBlock> {
    return this.http.get<ScheduleBlock>(`${this.resourceUrl(organizationId, specialistId)}/schedule-blocks/${blockId}`);
  }

  createBlock(organizationId: number, specialistId: number, request: ScheduleBlockRequest): Observable<ScheduleBlock> {
    return this.http.post<ScheduleBlock>(`${this.resourceUrl(organizationId, specialistId)}/schedule-blocks`, request);
  }

  updateBlock(organizationId: number, specialistId: number, blockId: number, request: ScheduleBlockRequest): Observable<ScheduleBlock> {
    return this.http.put<ScheduleBlock>(`${this.resourceUrl(organizationId, specialistId)}/schedule-blocks/${blockId}`, request);
  }

  private resourceUrl(organizationId: number, specialistId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/specialists/${specialistId}`;
  }
}
