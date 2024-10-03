import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { tablePageComponent } from './tablePage/tablePage.component';
import { NgModel } from '@angular/forms';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'tablePage', component: tablePageComponent }
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
  })

  export class AppRoutingModule{
    
  }