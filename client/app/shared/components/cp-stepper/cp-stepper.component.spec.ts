import { CPSession } from '../../../session';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import { CPStepperComponent } from './cp-stepper.component';
import { AdminService } from '../../services';

class MockAdminService {
  updateAdmin(userID: number, body: any) {
    let id;
    let is_onboarding;

    id = userID;
    is_onboarding = body.flags.is_onboarding;

    return is_onboarding;
  }
}

describe('CPStepperComponent', () => {
  let spy;
  let comp: CPStepperComponent;
  let service: AdminService;
  let fixture: ComponentFixture<CPStepperComponent>;

  const id = 123;
  const last = 4;
  const start = 1;
  const totalLength = 4;
  const body = {
    flags: {
      is_onboarding: true
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CPStepperComponent ],
      providers: [
        CPSession,
        { provide: AdminService, useClass: MockAdminService },
      ]
    }) .overrideComponent(CPStepperComponent, {
      set: {
        template: '<div>No Template</div>'
      }
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(CPStepperComponent);
      comp = fixture.componentInstance;
      service = TestBed.get(AdminService);
    });
  }));

  it('backStep() should decrement current step', () => {
    comp.backStep(2);
    expect(comp.currentStep).toEqual(1);
  });

  it('nextStep() should increment current step', () => {
    comp.totalSteps = Array.from(Array(totalLength), (_, i) => start + i);
    comp.nextStep(1);
    expect(comp.currentStep).toEqual(2);
  });

  it('should call updateAdmin() method on last step', () => {
    spy = spyOn(comp, 'updateAdmin');
    comp.totalSteps = Array.from(Array(totalLength), (_, i) => start + i);

    expect(spy).not.toHaveBeenCalled();
    comp.nextStep(last);

    expect(spy).toHaveBeenCalled();
    expect(service.updateAdmin(id, body)).toBeTruthy();
  });

});
