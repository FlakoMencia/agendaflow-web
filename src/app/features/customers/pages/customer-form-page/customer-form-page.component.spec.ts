import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';
import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { Customer, CustomerRequest } from '../../models/customer.model';
import { CustomersApiService } from '../../services/customers-api.service';
import { CustomerFormPageComponent } from './customer-form-page.component';
describe('CustomerFormPageComponent', () => {
  let api: CustomersStub;
  beforeEach(() => {
    api = new CustomersStub();
    TestBed.configureTestingModule({
      imports: [CustomerFormPageComponent],
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        { provide: AuthSessionService, useValue: new AuthSessionStub() },
        { provide: CustomersApiService, useValue: api },
      ],
    });
  });
  it('requires first and last name without requiring email or phone', () => {
    const fixture = TestBed.createComponent(CustomerFormPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(api.calls).toBe(0);
    fixture.componentInstance.form.patchValue({
      firstName: '  Ana ',
      lastName: ' Ramos ',
      email: null,
      phone: null,
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.submit();
    expect(api.calls).toBe(1);
    expect(api.request?.firstName).toBe('Ana');
    expect(api.request?.email).toBeNull();
  });
});
class CustomersStub {
  calls = 0;
  request: CustomerRequest | null = null;
  create(organizationId: number, request: CustomerRequest): Observable<Customer> {
    this.calls++;
    this.request = request;
    return of({ ...request, id: 1, organizationId, createdAt: '', updatedAt: '' });
  }
  update(): Observable<Customer> {
    throw new Error('Unexpected update');
  }
  get(): Observable<Customer> {
    throw new Error('Unexpected get');
  }
}
