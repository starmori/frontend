import {  async, TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';
import { DebugElement } from '@angular/core';

import { EventsModule } from '../../../events.module';
import { CPSession } from '../../../../../../../session';
import { AttendanceUpcomingComponent } from './upcoming.component';

fdescribe('AttendanceUpcomingComponent', () => {
  let component: AttendanceUpcomingComponent;
  let fixture: ComponentFixture<AttendanceUpcomingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        EventsModule,
        RouterTestingModule
      ],
      providers: [
        CPSession,
      ]
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AttendanceUpcomingComponent);

        component = fixture.componentInstance;
        component.event = {
          id: 1001,
          title: 'This is title',
          description: 'This is description',
          address: '7020 Saint Vallier, QC, H2S 2R2',
          end: 1523479847,
          start: 1618108386,
          latitude: 25.0700,
          longitude: 67.2848,
        };
      });
  }));

  it('should get upcoming event info', () => {
    const bannerDe: DebugElement = fixture.debugElement;
    const bannerEl: HTMLElement = bannerDe.nativeElement;
    fixture.detectChanges();

    const eventElement = bannerEl.querySelector('div.row div.event');

    const title = eventElement.children[0].querySelector('p.resource-banner__title');
    const details = bannerEl.querySelector('div.event__details div div');
    const description = eventElement.children[2].querySelector('p.no-margin-bottom');

    const startDate = details.children[0].querySelector('div.col-xs-9');
    const endDate = details.children[1].querySelector('div.col-xs-9');
    const address = details.children[2].querySelector('div.col-xs-9');

    expect(title.textContent).toEqual('This is title');
    expect(description.textContent).toContain('This is description');
    expect(endDate.textContent).toContain('April 11th 2018, 4:50 pm');
    expect(startDate.textContent).toContain('April 10th 2021, 10:33 pm');
    expect(address.textContent).toContain('7020 Saint Vallier, QC, H2S 2R2');
  });
});
