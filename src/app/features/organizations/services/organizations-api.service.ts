import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageRequest, PageResponse } from '../../../core/http/page-response.model';
import {
  CreateOrganizationRequest,
  Organization,
  OrganizationSummary,
  UpdateOrganizationRequest,
} from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly resourceUrl = `${this.apiConfig.baseUrl}/organizations`;

  list(request: PageRequest = {}): Observable<PageResponse<OrganizationSummary>> {
    const params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'legalName,asc');

    return this.http.get<PageResponse<OrganizationSummary>>(this.resourceUrl, { params });
  }

  get(organizationId: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.resourceUrl}/${organizationId}`);
  }

  create(request: CreateOrganizationRequest): Observable<Organization> {
    return this.http.post<Organization>(this.resourceUrl, request);
  }

  update(organizationId: number, request: UpdateOrganizationRequest): Observable<Organization> {
    return this.http.put<Organization>(`${this.resourceUrl}/${organizationId}`, request);
  }
}
