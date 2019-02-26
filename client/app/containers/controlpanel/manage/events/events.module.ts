import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import {
  ListActionBoxComponent,
  ListPastComponent,
  ListUpcomingComponent
} from './list/components';

import {
  EventsExcelModalComponent,
  EventsImportActionDropdownComponent,
  EventsImportTopBarComponent
} from './excel/components';

import { EventSourceToIconPipe } from './pipes';

import { EventsEditComponent } from './edit';
import { EventsListComponent } from './list';
import { EventsInfoComponent } from './info';
import { EventsExcelComponent } from './excel';
import { EventsCreateComponent } from './create';
import { EventsDeleteComponent } from './delete';
import { EventsAttendanceComponent } from './attendance';
import { EventsComponent } from './list/base/events.component';
import { EventsAttendanceActionBoxComponent } from './attendance/components';

import { EventsService } from './events.service';
import { EventUtilService } from './events.utils.service';
import { OrientationEventsService } from '../orientation/events/orientation.events.service';

import { AssessModule } from '../../assess/assess.module';
import { EventsRoutingModule } from './events.routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { CheckInModule } from './attendance/check-in/check-in.module';
import { EngagementModule } from '../../assess/engagement/engagement.module';
import { EngagementStudentsModule } from '../../assess/students/students.module';

@NgModule({
  declarations: [
    EventsComponent,
    ListPastComponent,
    EventsListComponent,
    EventsInfoComponent,
    EventsEditComponent,
    EventsExcelComponent,
    EventsCreateComponent,
    EventsDeleteComponent,
    EventSourceToIconPipe,
    ListUpcomingComponent,
    ListActionBoxComponent,
    EventsAttendanceComponent,
    EventsExcelModalComponent,
    EventsImportTopBarComponent,
    EventsAttendanceActionBoxComponent,
    EventsImportActionDropdownComponent
  ],

  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
    CheckInModule,
    EventsRoutingModule,
    ReactiveFormsModule,
    EngagementStudentsModule,
    AssessModule, // sorting based on route loading
    EngagementModule
  ],

  providers: [EventsService, EventUtilService, OrientationEventsService],

  exports: [
    EventsComponent,
    ListPastComponent,
    EventsListComponent,
    EventsInfoComponent,
    EventsEditComponent,
    EventsExcelComponent,
    EventsCreateComponent,
    ListUpcomingComponent,
    EventSourceToIconPipe,
    EventsDeleteComponent,
    ListActionBoxComponent,
    EventsAttendanceComponent,
    EventsExcelModalComponent,
    EventsImportTopBarComponent,
    EventsAttendanceActionBoxComponent,
    EventsImportActionDropdownComponent
  ]
})
export class EventsModule {}
