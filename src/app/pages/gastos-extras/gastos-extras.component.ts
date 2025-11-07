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
export default class GastosExtras implements OnInit {
  gastoService = inject(GastoService);
  authService = inject(AuthService);
  user : Observable<User | null> = this.authService.currentUser$;
  gastosExtras = signal<Gasto[]>([]);
  trashHide = signal<boolean>(true);
  gastosSeleccionadosArr = signal<Gasto[]>([]);

  formularioData = {
    nombre: '',
    monto: 0
  };

  async ngOnInit() : Promise<void> {

    try {
      this.user.subscribe(user => {
        if(user){
          console.log('🔍 Auth state changed in GastosFijosComponent:', user);

          this.gastoService.getAllGastos(2).subscribe((gastos : Gasto[])=> {
            console.log('Gastos obtenidos:', gastos);
            this.gastosExtras.set(gastos);
          });

        }
        else{
          console.log('⛔ No hay usuario autenticado en GastosFijosComponent');
        }
      });
    }
    catch (error) {
      console.error('Error during ngOnInit in GastosExtras component:', error);
    }
  }


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
    try {
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
    catch (error) {
      console.error('Error al crear un nuevo gasto extra:', error);
      throw error;
    }
  }

  editarGastoSeleccionado(gasto: Gasto) {

  }

  onGastoSelect(gasto: Gasto,$event: Event) {

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

  eliminarGastosSeleccionados() {
      Swal.fire({
        icon: 'warning',
        title: 'Borrar elementos',
        text: `¿Estás seguro de que deseas eliminar los ${this.gastosSeleccionadosArr().length} gastos seleccionados?`,
        showCancelButton: true,           // ← Mostrar botón cancelar
        confirmButtonText: 'Sí, eliminar', // ← Texto del botón confirmar
        cancelButtonText: 'No, cancelar',   // ← Texto del botón cancelar
        confirmButtonColor: '#EF4444',      // ← Rojo para eliminar
        cancelButtonColor: '#6B7280',       // ← Gris para cancelar
        reverseButtons: true                // ← Opcional: cancelar a la izquierda
      }).then((result) => {
        if (result.isConfirmed) {
          // ✅ Usuario confirmó - proceder a eliminar
          console.log('Usuario confirmó eliminación');
          this.procesarEliminacion();
        }
        else {
        // ❌ Usuario canceló
          console.log('Usuario canceló eliminación');
          Swal.fire({
            icon: 'info',
            title: 'Cancelado',
            text: 'Los gastos no fueron eliminados.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    }


     procesarEliminacion() {
        this.gastoService.eliminarGastos(this.gastosSeleccionadosArr()).then(() => {
          console.log('Gastos eliminados exitosamente');
          Swal.fire({
            icon: 'success',
            title: 'Eliminados',
            text: 'Los gastos seleccionados han sido eliminados.',
            timer: 1500,
            showConfirmButton: false
          });

          this.gastosExtras.update(gastos =>
            gastos.filter(gasto =>
              !this.gastosSeleccionadosArr().some(sel => sel.id === gasto.id)
            )
          );
          this.gastosSeleccionadosArr.set([]);
          this.trashHide.set(true);
        });
      }

}
