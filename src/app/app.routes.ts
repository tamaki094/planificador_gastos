import { Routes } from '@angular/router';
import { AuthGuardService } from './services/AuthGuard.service';

export const routes: Routes = [
  {
    path: 'gastos-fijos',
    loadComponent: () => import('./pages/GastosFijos/GastosFijos.component'),
    canActivate: [AuthGuardService]
  },
  {
    path: 'sueldo',
    loadComponent: () => import('./pages/Sueldo/Sueldo.component'),
    canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/Profile/Profile.component'),
    canActivate: [AuthGuardService]
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
