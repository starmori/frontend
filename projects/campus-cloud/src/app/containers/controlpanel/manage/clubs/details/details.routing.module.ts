import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClubsInfoComponent } from '../info';
import { ClubsWallComponent } from '../wall';
import { pageTitle } from '@campus-cloud/shared/constants';
import { ClubsDetailsComponent } from './details.component';

const appRoutes: Routes = [
  {
    path: '',
    component: ClubsDetailsComponent,
    children: [
      { path: 'info', component: ClubsInfoComponent, data: { title: pageTitle.MANAGE_CLUBS } },

      { path: 'feeds', component: ClubsWallComponent, data: { title: pageTitle.MANAGE_CLUBS } },

      {
        path: 'events',
        data: { title: pageTitle.MANAGE_CLUBS },
        loadChildren: '../events/events.module#ClubsEventsModule'
      },

      {
        path: 'members',
        data: { title: pageTitle.MANAGE_CLUBS },
        loadChildren: '../members/members.module#ClubsMembersModule'
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ClubsDetailsRoutingModule {}