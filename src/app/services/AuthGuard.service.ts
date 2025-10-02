import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  authService = inject(Auth);
  router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
     return new Promise((resolve) => {
      onAuthStateChanged(this.authService, (user) => {
        if (user) {
          // Usuario autenticado - permite el acceso
          resolve(true);
        } else {
          // Usuario NO autenticado - redirige al login
          console.log('Usuario no autenticado, redirigiendo a login...');
           Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Necesitas iniciar sesión para acceder a esta página.',
            confirmButtonColor: '#3B82F6'
          });
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }






}
