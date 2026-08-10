import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageRequest, PageResponse } from '../../../core/http/page-response.model';
import {
  Specialist,
  SpecialistBranchAssignment,
  SpecialistBranchAssignmentRequest,
  SpecialistRequest,
  SpecialistServiceAssignment,
  SpecialistServiceAssignmentRequest,
} from '../models/specialist.model';

@Injectable({ providedIn: 'root' })
export class SpecialistsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(organizationId: number, request: PageRequest = {}): Observable<PageResponse<Specialist>> {
    const params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'professionalName,asc');
    return this.http.get<PageResponse<Specialist>>(this.resourceUrl(organizationId), { params });
  }

  get(organizationId: number, specialistId: number): Observable<Specialist> {
    return this.http.get<Specialist>(`${this.resourceUrl(organizationId)}/${specialistId}`);
  }

  create(organizationId: number, request: SpecialistRequest): Observable<Specialist> {
    return this.http.post<Specialist>(this.resourceUrl(organizationId), request);
  }

  update(
    organizationId: number,
    specialistId: number,
    request: SpecialistRequest,
  ): Observable<Specialist> {
    return this.http.put<Specialist>(`${this.resourceUrl(organizationId)}/${specialistId}`, request);
  }

  listBranches(organizationId: number, specialistId: number): Observable<readonly SpecialistBranchAssignment[]> {
    return this.http.get<readonly SpecialistBranchAssignment[]>(`${this.resourceUrl(organizationId)}/${specialistId}/branches`);
  }

  assignBranch(organizationId: number, specialistId: number, branchId: number, request: SpecialistBranchAssignmentRequest): Observable<SpecialistBranchAssignment> {
    return this.http.put<SpecialistBranchAssignment>(`${this.resourceUrl(organizationId)}/${specialistId}/branches/${branchId}`, request);
  }

  listServices(organizationId: number, specialistId: number): Observable<readonly SpecialistServiceAssignment[]> {
    return this.http.get<readonly SpecialistServiceAssignment[]>(`${this.resourceUrl(organizationId)}/${specialistId}/services`);
  }

  assignService(organizationId: number, specialistId: number, serviceId: number, request: SpecialistServiceAssignmentRequest): Observable<SpecialistServiceAssignment> {
    return this.http.put<SpecialistServiceAssignment>(`${this.resourceUrl(organizationId)}/${specialistId}/services/${serviceId}`, request);
  }

  private resourceUrl(organizationId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/specialists`;
  }
}
