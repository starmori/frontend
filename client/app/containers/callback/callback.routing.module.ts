import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CallbackComponent } from './callback.component';
import { CallbackPasswordResetComponent } from './password-reset';

import { CheckinEventsComponent, CheckinServiceComponent } from './checkin';

import { FeedbackEventComponent, FeedbackServiceComponent } from './feedback';

import { AdminInviteComponent } from './admin-invite';

const appRoutes: Routes = [
  {
    path: '',
    component: CallbackComponent,
    children: [
      {
        path: 'password-reset/:key',
        data: { zendesk: 'password' },
        component: CallbackPasswordResetComponent,
      },

      {
        path: 'invite/:key',
        component: AdminInviteComponent,
        data: { zendesk: 'password' },
      },

      {
        path: 'feedback/e/:event',
        component: FeedbackEventComponent,
        data: { zendesk: 'assessment' },
      },
      {
        path: 'feedback/s/:service',
        component: FeedbackServiceComponent,
        data: { zendesk: 'assessment' },
      },

      {
        path: 'checkin/e/:event',
        component: CheckinEventsComponent,
        data: { zendesk: 'assessment' },
      },
      {
        path: 'checkin/s/:service/:provider',
        data: { zendesk: 'assessment' },
        component: CheckinServiceComponent,
      },

      { path: '**', redirectTo: '/login' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class CallbackRoutingModule {}