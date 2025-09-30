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
    path: '**',
    redirectTo: 'gastos-fijos'
  }
];
