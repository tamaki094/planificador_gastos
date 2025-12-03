import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { Gasto } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/Auth.service';
import { NotificacionComponent } from "../../components/Notificacion/Notificacion.component";

@Component({
  selector: 'app-notificaciones.component',
  imports: [NotificacionComponent],
  templateUrl: './Notificaciones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificacionesComponent implements OnInit {

  gastos = signal<Gasto[]>([]);
  user : User | null = null;

  gastoService = inject(GastoService);
  authService = inject(AuthService);

  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    await this.gastoService.getAllGastosByUser(this.user?.uid || '').subscribe(
      (gastos) => {
        this.gastos.set(gastos);
      }
    );
  }



}
