import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { providePrimeNG } from 'primeng/config';
import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { PageResponse } from '../../../../core/http/page-response.model';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { Branch } from '../../../branches/models/branch.model';
import { BranchesApiService } from '../../../branches/services/branches-api.service';
import { Customer } from '../../../customers/models/customer.model';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { CatalogService } from '../../../services/models/service-catalog.model';
import { ServicesApiService } from '../../../services/services/services-api.service';
import { Specialist } from '../../../specialists/models/specialist.model';
import { SpecialistsApiService } from '../../../specialists/services/specialists-api.service';
import {
  Appointment,
  AvailableSlotsResponse,
  CreateAppointmentRequest,
} from '../../models/appointment.model';
import { AppointmentsApiService } from '../../services/appointments-api.service';
import { AvailableSlotsApiService } from '../../services/available-slots-api.service';
import { AppointmentBookingPageComponent } from './appointment-booking-page.component';
describe('AppointmentBookingPageComponent', () => {
  let appointments: AppointmentsStub;
  let slots: SlotsStub;
  beforeEach(() => {
    appointments = new AppointmentsStub();
    slots = new SlotsStub();
    TestBed.configureTestingModule({
      imports: [AppointmentBookingPageComponent],
      providers: [
        provideRouter([]),
        providePrimeNG({ theme: { preset: AgendaFlowPreset } }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        { provide: AuthSessionService, useValue: new AuthSessionStub() },
        { provide: AppointmentsApiService, useValue: appointments },
        { provide: AvailableSlotsApiService, useValue: slots },
        { provide: BranchesApiService, useValue: { list: () => of(page([BRANCH])) } },
        { provide: CustomersApiService, useValue: { list: () => of(page([CUSTOMER])) } },
        {
          provide: ServicesApiService,
          useValue: {
            list: () => of(page([SERVICE])),
            listBranchServices: () =>
              of([
                { branchId: 1, serviceId: 2, serviceName: 'Visit', active: true, createdAt: '' },
              ]),
          },
        },
        {
          provide: SpecialistsApiService,
          useValue: {
            list: () => of(page([SPECIALIST])),
            listBranches: () =>
              of([
                {
                  specialistId: 3,
                  branchId: 1,
                  branchName: 'Main',
                  primary: true,
                  active: true,
                  createdAt: '',
                },
              ]),
            listServices: () =>
              of([
                {
                  specialistId: 3,
                  serviceId: 2,
                  serviceName: 'Visit',
                  customDurationMinutes: null,
                  customPrice: null,
                  active: true,
                  createdAt: '',
                },
              ]),
          },
        },
      ],
    });
  });
  it('uses backend slots and refreshes them after a booking conflict', async () => {
    appointments.response = throwError(
      () =>
        new HttpErrorResponse({ status: 409, error: { status: 409, code: 'SLOT_NOT_AVAILABLE' } }),
    );
    const fixture = TestBed.createComponent(AppointmentBookingPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const c = fixture.componentInstance;
    c.form.patchValue({ customerId: 4, branchId: 1 });
    c.branchChanged();
    c.form.controls.serviceId.setValue(2);
    c.contextChanged();
    expect(slots.calls).toBe(1);
    const slot = c.slots()[0];
    c.selectSlot(slot);
    c.submit();
    expect(appointments.calls).toBe(1);
    expect(c.selectedSlot()).toBeNull();
    expect(slots.calls).toBe(2);
    expect(c.error()?.status).toBe(409);
  });
});
class AppointmentsStub {
  calls = 0;
  response: Observable<Appointment> = of({} as Appointment);
  create(_oid: number, _request: CreateAppointmentRequest): Observable<Appointment> {
    this.calls++;
    return this.response;
  }
}
class SlotsStub {
  calls = 0;
  list(): Observable<AvailableSlotsResponse> {
    this.calls++;
    return of({
      date: '2026-08-10',
      branchId: 1,
      serviceId: 2,
      timezone: 'America/El_Salvador',
      slots: [{ specialistId: 3, start: '2026-08-10T16:00:00Z', end: '2026-08-10T16:30:00Z' }],
    });
  }
}
const BRANCH: Branch = {
  id: 1,
  organizationId: 42,
  name: 'Main',
  code: null,
  email: null,
  phone: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  stateCode: null,
  postalCode: null,
  countryCode: 'SV',
  timezone: 'America/El_Salvador',
  latitude: null,
  longitude: null,
  active: true,
  createdAt: '',
  updatedAt: '',
};
const SERVICE: CatalogService = {
  id: 2,
  organizationId: 42,
  categoryId: null,
  name: 'Visit',
  description: null,
  durationMinutes: 30,
  preparationMinutes: 0,
  cleanupMinutes: 0,
  price: null,
  currencyCode: 'USD',
  requiresApproval: false,
  allowsOnlineBooking: true,
  active: true,
  colorCode: null,
  createdAt: '',
  updatedAt: '',
};
const SPECIALIST: Specialist = {
  id: 3,
  organizationId: 42,
  userId: null,
  professionalName: 'Dr Ada',
  specialtyName: null,
  biography: null,
  licenseNumber: null,
  photoUrl: null,
  phone: null,
  email: null,
  simultaneousCapacity: 1,
  active: true,
  createdAt: '',
  updatedAt: '',
};
const CUSTOMER: Customer = {
  id: 4,
  organizationId: 42,
  customerNumber: null,
  firstName: 'Ana',
  middleName: null,
  lastName: 'Ramos',
  secondLastName: null,
  email: null,
  phone: null,
  alternatePhone: null,
  dateOfBirth: null,
  preferredLanguage: null,
  preferredContactMethod: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  stateCode: null,
  postalCode: null,
  countryCode: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  emergencyContactRelationship: null,
  emailConsent: false,
  smsConsent: true,
  marketingConsent: false,
  termsAcceptedAt: null,
  privacyPolicyAcceptedAt: null,
  internalNotes: null,
  active: true,
  createdAt: '',
  updatedAt: '',
};
function page<T>(content: readonly T[]): PageResponse<T> {
  return {
    content,
    page: 0,
    size: 100,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
  };
}
