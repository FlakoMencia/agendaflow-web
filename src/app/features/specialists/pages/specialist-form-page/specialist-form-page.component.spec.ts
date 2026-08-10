import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';

import { AgendaFlowPreset } from '../../../../core/config/agendaflow.preset';
import { AuthSessionService } from '../../../../core/security/auth-session.service';
import { AuthSessionStub } from '../../../../testing/auth-fixtures';
import { Specialist, SpecialistRequest } from '../../models/specialist.model';
import { SpecialistsApiService } from '../../services/specialists-api.service';
import { SpecialistFormPageComponent } from './specialist-form-page.component';

describe('SpecialistFormPageComponent', () => {
  let api: SpecialistFormApiStub;
  beforeEach(() => {
    api = new SpecialistFormApiStub();
    TestBed.configureTestingModule({ imports: [SpecialistFormPageComponent], providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: AuthSessionService, useValue: new AuthSessionStub() }, { provide: SpecialistsApiService, useValue: api }] });
  });

  it('does not create an invalid specialist', () => {
    const fixture = TestBed.createComponent(SpecialistFormPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(api.createCalls).toBe(0);
    expect(fixture.componentInstance.form.controls.professionalName.touched).toBe(true);
  });

  it('creates a specialist in the active organization', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SpecialistFormPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({ professionalName: 'Ada Lovelace', email: 'ada@example.com', simultaneousCapacity: 2 });
    fixture.componentInstance.submit();
    expect(api.createCalls).toBe(1);
    expect(api.organizationId).toBe(42);
    expect(api.request?.professionalName).toBe('Ada Lovelace');
  });
});

class SpecialistFormApiStub {
  createCalls = 0; organizationId: number | null = null; request: SpecialistRequest | null = null;
  create(organizationId: number, request: SpecialistRequest): Observable<Specialist> { this.createCalls += 1; this.organizationId = organizationId; this.request = request; return of({ id: 8, organizationId, userId: request.userId, professionalName: request.professionalName, specialtyName: request.specialtyName, biography: request.biography, licenseNumber: request.licenseNumber, photoUrl: request.photoUrl, phone: request.phone, email: request.email, simultaneousCapacity: request.simultaneousCapacity ?? 1, active: request.active ?? true, createdAt: '', updatedAt: '' }); }
  update(): Observable<Specialist> { throw new Error('Unexpected update'); }
  get(): Observable<Specialist> { throw new Error('Unexpected get'); }
}
