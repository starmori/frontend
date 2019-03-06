import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpParams } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';

import { CPSession } from '@app/session';
import { EventsModule } from '../events.module';
import { CPI18nService } from '@shared/services';
import { EventsService } from '../events.service';
import { mockSchool } from '@app/session/mock/school';
import { mockEvent, MockEventService } from './../tests';
import { CPDeleteModalComponent } from '@shared/components';
import { configureTestSuite } from '@client/app/shared/tests';
import { EventsDeleteComponent } from './events-delete.component';

describe('EventDeleteComponent', () => {
  configureTestSuite();

  beforeAll((done) => {
    (async () => {
      TestBed.configureTestingModule({
        imports: [EventsModule, RouterTestingModule],
        providers: [
          CPSession,
          CPI18nService,
          { provide: EventsService, useClass: MockEventService }
        ]
      });
      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let spy;
  let search;
  let eventId;
  let de: DebugElement;
  let component: EventsDeleteComponent;
  let deleteModal: CPDeleteModalComponent;
  let fixture: ComponentFixture<EventsDeleteComponent>;

  beforeEach(
    async(() => {
      fixture = TestBed.createComponent(EventsDeleteComponent);
      component = fixture.componentInstance;
      de = fixture.debugElement;
      deleteModal = de.query(By.directive(CPDeleteModalComponent)).componentInstance;

      component.event = mockEvent;

      eventId = component.event.id;
      component.session.g.set('school', mockSchool);
    })
  );

  it('should call onDelete on cp-delete-modal deleteClick', () => {
    spyOn(component, 'onDelete');
    deleteModal.deleteClick.emit();

    expect(component.onDelete).toHaveBeenCalled();
  });

  it('should call onClose on cp-delete-modal cancelClick', () => {
    spyOn(component, 'onClose');
    deleteModal.cancelClick.emit();

    expect(component.onClose).toHaveBeenCalled();
  });

  it('should delete orientation event', () => {
    component.orientationId = 10045;
    spy = spyOn(component.service, 'deleteEventById').and.returnValue(of({}));
    search = new HttpParams()
      .append('school_id', component.session.g.get('school').id)
      .append('calendar_id', component.orientationId.toString());

    component.onDelete();
    expect(spy).toHaveBeenCalledWith(eventId, search);
    expect(spy.calls.count()).toBe(1);
  });
});
