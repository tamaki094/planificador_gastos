import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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

  async onGoogleLogin() {
    try {
      const result = await this.authService.loginWithGoogle();
      if(result && result.user){
        this.router.navigate(['/dashboard']);
      }

    }
    catch (error) {
      console.error('Error during Google login:', error);
    }
  }


}

