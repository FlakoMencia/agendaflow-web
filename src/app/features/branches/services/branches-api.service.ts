import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageRequest, PageResponse } from '../../../core/http/page-response.model';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(organizationId: number, request: PageRequest = {}): Observable<PageResponse<Branch>> {
    const params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'name,asc');

    return this.http.get<PageResponse<Branch>>(this.resourceUrl(organizationId), { params });
  }

  get(organizationId: number, branchId: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.resourceUrl(organizationId)}/${branchId}`);
  }

  create(organizationId: number, request: CreateBranchRequest): Observable<Branch> {
    return this.http.post<Branch>(this.resourceUrl(organizationId), request);
  }

  update(
    organizationId: number,
    branchId: number,
    request: UpdateBranchRequest,
  ): Observable<Branch> {
    return this.http.put<Branch>(`${this.resourceUrl(organizationId)}/${branchId}`, request);
  }

  private resourceUrl(organizationId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/branches`;
  }
}
