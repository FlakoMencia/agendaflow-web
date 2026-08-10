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
import { AvailabilityRequest, AvailabilitySchedule, ScheduleBlock, ScheduleBlockRequest } from '../../models/scheduling.model';
import { Specialist } from '../../models/specialist.model';
import { AvailabilityApiService } from '../../services/availability-api.service';
import { SpecialistsApiService } from '../../services/specialists-api.service';
import { SpecialistAvailabilityPageComponent } from './specialist-availability-page.component';

describe('SpecialistAvailabilityPageComponent', () => {
  let api: AvailabilityApiStub;
  beforeEach(() => {
    api = new AvailabilityApiStub();
    TestBed.configureTestingModule({ imports: [SpecialistAvailabilityPageComponent], providers: [provideRouter([]), providePrimeNG({ theme: { preset: AgendaFlowPreset } }), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ specialistId: '8' }) } } }, { provide: AuthSessionService, useValue: new AuthSessionStub() }, { provide: AvailabilityApiService, useValue: api }, { provide: SpecialistsApiService, useValue: { get: () => of(SPECIALIST) } }, { provide: BranchesApiService, useValue: { list: () => of(page([BRANCH])) } }] });
  });

  it('rejects availability and block ranges whose end is not later', async () => {
    const fixture = TestBed.createComponent(SpecialistAvailabilityPageComponent);
    fixture.detectChanges(); await fixture.whenStable();
    fixture.componentInstance.openNewSchedule();
    fixture.componentInstance.scheduleForm.patchValue({ startTime: '17:00', endTime: '09:00' });
    fixture.componentInstance.saveSchedule();
    expect(fixture.componentInstance.scheduleForm.hasError('timeOrder')).toBe(true);
    expect(api.createAvailabilityCalls).toBe(0);
    fixture.componentInstance.openNewBlock();
    fixture.componentInstance.blockForm.patchValue({ startsAt: '2026-08-10T17:00', endsAt: '2026-08-10T09:00' });
    fixture.componentInstance.saveBlock();
    expect(fixture.componentInstance.blockForm.hasError('timeOrder')).toBe(true);
    expect(api.createBlockCalls).toBe(0);
  });

  it('keeps the editor open and shows a specific overlap error', async () => {
    api.availabilityResponse = throwError(() => new HttpErrorResponse({ status: 409, error: { status: 409, code: 'SCHEDULE_OVERLAP', message: 'Overlap' } }));
    const fixture = TestBed.createComponent(SpecialistAvailabilityPageComponent);
    fixture.detectChanges(); await fixture.whenStable();
    fixture.componentInstance.openNewSchedule(1);
    fixture.componentInstance.scheduleForm.patchValue({ branchId: 7, startTime: '09:00', endTime: '17:00' });
    fixture.componentInstance.saveSchedule();
    expect(fixture.componentInstance.scheduleEditorOpen()).toBe(true);
    expect(fixture.componentInstance.scheduleError()?.message).toContain('overlaps');
  });

  it('creates availability and a schedule block from valid forms', async () => {
    const fixture = TestBed.createComponent(SpecialistAvailabilityPageComponent);
    fixture.detectChanges(); await fixture.whenStable();
    fixture.componentInstance.openNewSchedule(2);
    fixture.componentInstance.scheduleForm.patchValue({ branchId: 7, startTime: '09:00', endTime: '12:00' });
    fixture.componentInstance.saveSchedule();
    expect(api.createAvailabilityCalls).toBe(1);
    expect(fixture.componentInstance.scheduleEditorOpen()).toBe(false);

    fixture.componentInstance.openNewBlock();
    fixture.componentInstance.blockForm.patchValue({ blockType: 'MEETING', startsAt: '2026-08-10T09:00', endsAt: '2026-08-10T10:00', reason: 'Team sync' });
    fixture.componentInstance.saveBlock();
    expect(api.createBlockCalls).toBe(1);
    expect(fixture.componentInstance.blockEditorOpen()).toBe(false);
  });
});

class AvailabilityApiStub {
  createAvailabilityCalls = 0; createBlockCalls = 0;
  availabilityResponse: Observable<AvailabilitySchedule> = of({} as AvailabilitySchedule);
  listAvailability(): Observable<readonly AvailabilitySchedule[]> { return of([]); }
  listBlocks(): Observable<PageResponse<ScheduleBlock>> { return of(page([])); }
  createAvailability(_organizationId: number, _specialistId: number, _request: AvailabilityRequest): Observable<AvailabilitySchedule> { this.createAvailabilityCalls += 1; return this.availabilityResponse; }
  updateAvailability(): Observable<AvailabilitySchedule> { return this.availabilityResponse; }
  createBlock(_organizationId: number, _specialistId: number, _request: ScheduleBlockRequest): Observable<ScheduleBlock> { this.createBlockCalls += 1; return of({} as ScheduleBlock); }
  updateBlock(): Observable<ScheduleBlock> { return of({} as ScheduleBlock); }
}

const SPECIALIST: Specialist = { id: 8, organizationId: 42, userId: null, professionalName: 'Ada', specialtyName: null, biography: null, licenseNumber: null, photoUrl: null, phone: null, email: null, simultaneousCapacity: 1, active: true, createdAt: '', updatedAt: '' };
const BRANCH: Branch = { id: 7, organizationId: 42, name: 'Main', code: null, email: null, phone: null, addressLine1: null, addressLine2: null, city: null, stateCode: null, postalCode: null, countryCode: 'US', timezone: null, latitude: null, longitude: null, active: true, createdAt: '', updatedAt: '' };
function page<T>(content: readonly T[]): PageResponse<T> { return { content, page: 0, size: 20, totalElements: content.length, totalPages: content.length ? 1 : 0, first: true, last: true }; }
