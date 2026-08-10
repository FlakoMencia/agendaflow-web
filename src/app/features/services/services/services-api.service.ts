import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageRequest, PageResponse } from '../../../core/http/page-response.model';
import {
  BranchServiceAssignment,
  BranchServiceAssignmentRequest,
  CatalogService,
  CatalogServiceRequest,
} from '../models/service-catalog.model';

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(organizationId: number, request: PageRequest = {}): Observable<PageResponse<CatalogService>> {
    const params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'name,asc');
    return this.http.get<PageResponse<CatalogService>>(this.resourceUrl(organizationId), { params });
  }

  get(organizationId: number, serviceId: number): Observable<CatalogService> {
    return this.http.get<CatalogService>(`${this.resourceUrl(organizationId)}/${serviceId}`);
  }

  create(organizationId: number, request: CatalogServiceRequest): Observable<CatalogService> {
    return this.http.post<CatalogService>(this.resourceUrl(organizationId), request);
  }

  update(
    organizationId: number,
    serviceId: number,
    request: CatalogServiceRequest,
  ): Observable<CatalogService> {
    return this.http.put<CatalogService>(`${this.resourceUrl(organizationId)}/${serviceId}`, request);
  }

  listBranchServices(
    organizationId: number,
    branchId: number,
  ): Observable<readonly BranchServiceAssignment[]> {
    return this.http.get<readonly BranchServiceAssignment[]>(this.branchUrl(organizationId, branchId));
  }

  assignBranch(
    organizationId: number,
    branchId: number,
    serviceId: number,
    request: BranchServiceAssignmentRequest,
  ): Observable<BranchServiceAssignment> {
    return this.http.put<BranchServiceAssignment>(
      `${this.branchUrl(organizationId, branchId)}/${serviceId}`,
      request,
    );
  }

  private resourceUrl(organizationId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/services`;
  }

  private branchUrl(organizationId: number, branchId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/branches/${branchId}/services`;
  }
}
