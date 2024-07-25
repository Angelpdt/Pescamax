import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { RecuperarPageComponent } from './recuperar-page/recuperar-page.component';
import { CambiarPageComponent } from './cambiar-page/cambiar-page.component';
import { LoginComponent } from '../../../../shared/components/molecules/login/login.component';
import { RegisterComponent } from '../../../../shared/components/molecules/register/register.component';
import { ForgotPasswordComponent } from '../../../../shared/components/molecules/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../../../shared/components/molecules/reset-password/reset-password.component';


@NgModule({
  declarations: [
    PageNotFoundComponent,
    HomepageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    RecuperarPageComponent,
    CambiarPageComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
    
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    RegisterPageComponent,

  ]
})
export class HomeModule { }
