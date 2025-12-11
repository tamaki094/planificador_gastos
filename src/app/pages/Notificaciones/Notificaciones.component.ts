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
    fechaInicio: '',
    fechaFin: '',
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

    const filtroTexto = this.formularioData.filtroTexto.toLowerCase();
    const fechaInicioFiltro = this.formularioData.fechaInicio;
    const fechaFinFiltro = this.formularioData.fechaFin;
    const categoriaFiltro = this.formularioData.categoria;

    console.log("Filtrando con:\n" +
      `Texto: ${filtroTexto}\n` +
      `Fecha Inicio: ${fechaInicioFiltro}\n` +
      `Fecha Fin: ${fechaFinFiltro}\n` +
      `Categoría: ${categoriaFiltro}`
    );

    this.gastoService.getAllGastosByUser(this.user?.uid || '').subscribe((gastos) => {
      let gastosFiltrados = gastos;

      if (filtroTexto) {
        gastosFiltrados = gastosFiltrados.filter(gasto =>
          gasto.name.toLowerCase().includes(filtroTexto)
        );
      }

      if (fechaInicioFiltro) {
        const fechaInicio = new Date(fechaInicioFiltro);
        gastosFiltrados = gastosFiltrados.filter(gasto =>
          gasto.fecha_creacion >= fechaInicio
        );
      }
      if (fechaFinFiltro) {
        const fechaFin = new Date(fechaFinFiltro);
        gastosFiltrados = gastosFiltrados.filter(gasto =>
          gasto.fecha_creacion <= fechaFin
        );
      }

      if (categoriaFiltro) {
        gastosFiltrados = gastosFiltrados.filter(gasto =>
          gasto.categoria_gasto === categoriaFiltro
        );
      }

      this.gastos.set(gastosFiltrados);
    });
  }

  limpiarFiltros() {
    this.formularioData = {
      filtroTexto: '',
      fechaInicio: '',
      fechaFin: '',
      categoria: ''
    };
    this.filtrarNotificaciones();
  }

}
