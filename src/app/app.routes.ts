import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'gastos-fijos',
    loadComponent: () => import('./pages/GastosFijos/GastosFijos.component')
  },
  {
    path: 'sueldo',
    loadComponent: () => import('./pages/Sueldo/Sueldo.component')
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/Profile/Profile.component')
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/Login/Login.component')
  },
  {
    path: '**',
    redirectTo: 'gastos-fijos'
  }
];
