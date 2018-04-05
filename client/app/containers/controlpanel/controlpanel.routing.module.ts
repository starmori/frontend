import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ControlPanelComponent } from './controlpanel.component';
import { CPPreloadStrategy } from './../../config/strategies/preload.strategy';

const appRoutes: Routes = [
  // // HOME PAGE
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: '',
    component: ControlPanelComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
      },

      { path: 'manage', loadChildren: './manage/manage.module#ManageModule' },

      { path: 'notify', loadChildren: './notify/notify.module#NotifyModule' },

      { path: 'assess', loadChildren: './assess/assess.module#AssessModule' },

      {
        path: 'customise',
        loadChildren: './customise/customise.module#CustomiseModule',
      },

      {
        path: 'account',
        loadChildren: './account/account.module#AccountModule',
      },

      {
        path: 'demo',
        loadChildren: './request-demo/request-demo.module#RequestDemoModule',
      },

      {
        path: 'settings',
        loadChildren: './settings/settings.module#SettingsModule',
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  providers: [CPPreloadStrategy],
  exports: [RouterModule],
})
export class ControlPanelRoutingModule {}