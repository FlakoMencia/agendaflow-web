import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { ServiceCategory, ServiceCategoryRequest } from '../models/service-catalog.model';

@Injectable({ providedIn: 'root' })
export class ServiceCategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(organizationId: number): Observable<readonly ServiceCategory[]> {
    return this.http.get<readonly ServiceCategory[]>(this.resourceUrl(organizationId));
  }

  get(organizationId: number, categoryId: number): Observable<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.resourceUrl(organizationId)}/${categoryId}`);
  }

  create(organizationId: number, request: ServiceCategoryRequest): Observable<ServiceCategory> {
    return this.http.post<ServiceCategory>(this.resourceUrl(organizationId), request);
  }

  update(
    organizationId: number,
    categoryId: number,
    request: ServiceCategoryRequest,
  ): Observable<ServiceCategory> {
    return this.http.put<ServiceCategory>(
      `${this.resourceUrl(organizationId)}/${categoryId}`,
      request,
    );
  }

  private resourceUrl(organizationId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/service-categories`;
  }
}
