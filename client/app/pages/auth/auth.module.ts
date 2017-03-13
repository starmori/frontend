import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { LogoutComponent } from './logout';
import { PasswordResetComponent } from './password-reset';

import { AuthService } from './auth.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ LoginComponent, LogoutComponent, PasswordResetComponent ],
  imports: [ BrowserModule, ReactiveFormsModule, SharedModule, RouterModule ],
  providers: [ AuthService ],
})
export class AuthModule {}
