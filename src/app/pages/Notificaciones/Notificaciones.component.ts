import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { Categoria, Gasto } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/Auth.service';
import { NotificacionComponent } from "../../components/Notificacion/Notificacion.component";
import { NgForm, FormsModule} from '@angular/forms'
import { CategoriaService } from '../../services/Categoria.service';

@Component({
  selector: 'app-notificaciones.component',
  imports: [NotificacionComponent, FormsModule],
  templateUrl: './Notificaciones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificacionesComponent implements OnInit {
  gastos = signal<Gasto[]>([]);
  user : User | null = null;
  categorias = signal<Categoria[]>([]);

  gastoService = inject(GastoService);
  categoriaService = inject(CategoriaService);
  authService = inject(AuthService);

   formularioData = {
    filtroTexto: '',
    fecha: '',
    categoria: ''
  };

  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    await this.gastoService.getAllGastosByUser(this.user?.uid || '').subscribe(
      (gastos) => {
        this.gastos.set(gastos);
      }
    );

    await this.categoriaService.getAllCategorias().subscribe(
      (categorias) => {
        this.categorias.set(categorias);
      }
    )
  }

  filtrarNotificaciones() {

  }

  limpiarFiltros() {
    this.filtrarNotificaciones();
  }

}
