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
    nombre: '',
    monto: 0
  };

  authService = inject(AuthService);
  user : Observable<User | null> = this.authService.currentUser$;
  gastoService = inject(GastoService);
  gastosFijos = signal<Gasto[]>([]);

  async onSubmit(form: NgForm) {
    try {
      const formData = form.value;
      if (form.valid) {
        console.log('Formulario de gasto extra enviado con datos:', formData);
        await this.crearNuevoGasto(formData);
        this.limpiarFormulario(form);
      }
    }
    catch (error) {
      console.error('Error al enviar el formulario de gasto extra:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar el gasto extra. Por favor, inténtalo de nuevo.'
      });
    }
  }

  private async crearNuevoGasto(formData: any) {
    const nuevoGasto: Omit<Gasto, 'id'> = {
      categoria_gasto: 'extra',
      name: formData.nombre,
      monto: formData.monto,
      fecha_creacion: new Date(),
      usuario: this.authService.getCurrentUser()?.uid || 'desconocido',
      fecha_actualizacion: new Date(),
      tipo_gasto: TipoGasto.VARIABLE
    };

    await this.gastoService.crearGasto(nuevoGasto);


  }

  limpiarFormulario(form?: NgForm) {
    this.formularioData = {
      nombre: '',
      monto: 0
    };

    if (form) {
      form.resetForm();
    }
  }
}
