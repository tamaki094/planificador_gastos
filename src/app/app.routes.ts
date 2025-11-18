import { Routes } from '@angular/router';
import { AuthGuardService } from './services/AuthGuard.service';

export const routes: Routes = [
  {
    path: 'gastos-fijos',
    loadComponent: () => import('./pages/gasto-fijos/gastos-fijos.component'),
    canActivate: [AuthGuardService]
  },
  {
    path: 'gastos-extras',
    loadComponent: () => import('./pages/gastos-extras/gastos-extras.component'),
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
    path: 'dashboard',
    loadComponent: () => import('./pages/Dashboard/Dashboard.component'),
    canActivate: [AuthGuardService]
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/Notificaciones/Notificaciones.component'),
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
