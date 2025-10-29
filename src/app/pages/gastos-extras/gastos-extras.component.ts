import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/Auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { CategoriaService } from '../../services/Categoria.service';
import { Gasto, TipoGasto, Categoria } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gastos-extras',
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos-extras.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosExtras {

    formularioData = {
    categoria: '',
    nombre: '',
    monto: 0
  };

  authService = inject(AuthService);
  user : Observable<User | null> = this.authService.currentUser$;
  gastoService = inject(GastoService);
  gastosFijos = signal<Gasto[]>([]);

  async onSubmit(form: NgForm) {
    const formData = form.value;
    if (form.valid) {
      console.log('Formulario de gasto extra enviado con datos:', formData);
      // Aquí puedes agregar la lógica para manejar el envío del formulario,
      // como llamar a un servicio para guardar el gasto extra en la base de datos.
    }
  }
}
