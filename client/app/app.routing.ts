import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { isProd } from './config/env/index';
import { LoginComponent, LogoutComponent, LostPasswordComponent } from './containers/auth';

const routes: Routes = [
  {
    path: '',
    loadChildren: './containers/controlpanel/controlpanel.module#ControlPanelModule'
  },

  {
    path: 'login',
    data: { zendesk: 'login' },
    component: LoginComponent
  },

  {
    path: 'lost-password',
    data: { zendesk: 'password' },
    component: LostPasswordComponent
  },

  {
    path: 'cb',
    loadChildren: './containers/callback/callback.module#CallbackModule'
  },

  { path: 'logout', component: LogoutComponent },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
      preloadingStrategy: isProd ? PreloadAllModules : null
    })
  ],
  exports: [RouterModule]
})
export class TopLevelRoutesModule {}
