import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../services/Auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'login-page',
  imports: [],
  templateUrl: './Login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // ✅ Método simple de login (como lo tenías antes)
  async onGoogleLogin() {
    try {
      console.log('🔄 Iniciando login con Google...');

      const result = await this.authService.loginWithGoogle();

      // ✅ Verificar si hay usuario (funciona con popup y redirect)
      if (result && result.user) {
        console.log('✅ Usuario logueado:', result.user.email);

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${result.user.displayName || result.user.email}`,
          timer: 1500,
          showConfirmButton: false
        });

        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      }

    } catch (error) {
      console.error('❌ Error during Google login:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error de Login',
        text: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
        confirmButtonText: 'Entendido'
      });
    }
  }
}
