import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';
import { PageRequest, PageResponse } from '../../../core/http/page-response.model';
import { CreateCustomerRequest, Customer, UpdateCustomerRequest } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  list(organizationId: number, request: PageRequest = {}): Observable<PageResponse<Customer>> {
    const params = new HttpParams()
      .set('page', request.page ?? 0)
      .set('size', request.size ?? 20)
      .set('sort', request.sort ?? 'lastName,asc');
    return this.http.get<PageResponse<Customer>>(this.resourceUrl(organizationId), { params });
  }

  get(organizationId: number, customerId: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.resourceUrl(organizationId)}/${customerId}`);
  }

  create(organizationId: number, request: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.resourceUrl(organizationId), request);
  }

  update(
    organizationId: number,
    customerId: number,
    request: UpdateCustomerRequest,
  ): Observable<Customer> {
    return this.http.put<Customer>(`${this.resourceUrl(organizationId)}/${customerId}`, request);
  }

  private resourceUrl(organizationId: number): string {
    return `${this.apiConfig.baseUrl}/organizations/${organizationId}/customers`;
  }
}
