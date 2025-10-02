import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthService } from '../../services/Auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'login-page',
  imports: [],
  templateUrl: './Login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  authService = inject(AuthService);

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
    }
    catch (error) {
      console.error('Error during Google login:', error);
    }
  }


}

