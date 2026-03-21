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
    path: 'chat',
    loadComponent: () => import('./pages/Chat/chat.component')
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/Blog/Blog.component')
  },

  // TIENDA ITALIKA - Rutas existentes
  {
    path: 'tienda',
    loadComponent: () => import('./pages/TiendaItalika/TiendaItalika'),
    children: [
      // CATÁLOGO
      {
        path: 'catalogo',
        loadComponent: () => import('./pages/TiendaItalika/CatalogoProductos/CatalogoProductos'),
        title: 'Catálogo - Tienda Italika'
      },

      // ÓRDENES DE COMPRA
      {
        path: 'ordenes-compra',
        loadComponent: () => import('./pages/TiendaItalika/OrdenesCompra/OrdenesCompra'),
        title: 'Órdenes de Compra - Tienda Italika',
      },

      // PAGO DE ORDEN
      {
        path: 'pago-orden',
        loadComponent: () => import('./pages/TiendaItalika/OrdenesCompra/PagoOrdenCompra/PagoOrdenCompra'),
        title: 'Pago de Orden - Tienda Italika',
      },

      // Ruta específica para pagar una orden particular
      {
        path: 'pago-orden/:ordenId',
        loadComponent: () => import('./pages/TiendaItalika/OrdenesCompra/PagoOrdenCompra/PagoOrdenCompra'),
        title: 'Procesar Pago - Tienda Italika',
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'gastos-fijos'
  }
];
