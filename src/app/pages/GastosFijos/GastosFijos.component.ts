import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/Auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { CategoriaService } from '../../services/Categoria.service';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule} from '@angular/forms'
import { Gasto, TipoGasto, Categoria } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gastos-fijos',
  imports: [CommonModule, FormsModule],
  templateUrl: './GastosFijos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosFijosComponent implements OnInit {

  authService = inject(AuthService);
  user : Observable<User | null> = this.authService.currentUser$;
  categoriasService = inject(CategoriaService);
  gastoService = inject(GastoService);
  gastosFijos = signal<Gasto[]>([]);
  trashHide = signal<boolean>(true);
  gastosSeleccionadosArr = signal<Gasto[]>([]);
  gastoEnEdicion = signal<Gasto | null>(null);

  formularioData = {
    categoria: '',
    nombre: '',
    monto: 0
  };


  ngOnInit() : void{
    this.user.subscribe(user => {
      if(user){
        console.log('🔍 Auth state changed in GastosFijosComponent:', user);

        this.gastoService.getAllGastos().subscribe((gastos : Gasto[])=> {
          console.log('Gastos obtenidos:', gastos);
          this.gastosFijos.set(gastos);
        });

      }
      else{
        console.log('⛔ No hay usuario autenticado en GastosFijosComponent');
      }

      const resultado = this.categoriasService.getAllCategorias().subscribe(categorias => {
        console.log('Categorías obtenidas:', categorias);
      });
    });
  }

  onGastoSelect(gasto: Gasto, $event: Event) {
    const isChecked = ($event.target as HTMLInputElement).checked;

    if (isChecked) {
      // ✅ Checkbox marcado = AGREGAR gasto
      this.gastosSeleccionadosArr.update(gastos => [...gastos, gasto]);
      this.trashHide.set(false);
    }
    else {
      // ✅ Checkbox desmarcado = QUITAR gasto
      this.gastosSeleccionadosArr.update(gastos =>
        gastos.filter(g => g.id !== gasto.id)
      );

      // Si ya no hay seleccionados, ocultar botón
      if (this.gastosSeleccionadosArr().length === 0) {
        this.trashHide.set(true);
      }
    }
  }

  async onSubmit(form: NgForm) {
    console.log('Formulario enviado:', form.value);
    if(form.valid){
      const formData = form.value;

      if (this.gastoEnEdicion()) {
        // MODO EDICIÓN
        await this.actualizarGasto(formData);
      }
      else {
        // MODO CREACIÓN
        await this.crearNuevoGasto(formData);
      }
    }
  }

  private async actualizarGasto(formData: any) {
    const gastoActualizado: Partial<Gasto> = {
      categoria_gasto: formData.categoria,
      name: formData.nombre,
      monto: parseFloat(formData.monto),
      fecha_actualizacion: new Date()
    };

    try {
      await this.gastoService.actualizarGasto(this.gastoEnEdicion()!.id!, gastoActualizado);

      // Actualizar la lista local
      this.gastosFijos.update(gastos =>
        gastos.map(g =>
          g.id === this.gastoEnEdicion()!.id
            ? { ...g, ...gastoActualizado }
            : g
        )
      );

      this.limpiarFormulario();

      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Gasto actualizado correctamente.',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el gasto.'
      });
    }
  }

  private async crearNuevoGasto(formData: any) {
    // Tu lógica actual de creación
    const nuevoGasto: Omit<Gasto, 'id'> = {
      categoria_gasto: formData.categoria,
      fecha_creacion: new Date(),
      monto: parseFloat(formData.monto),
      name: formData.nombre,
      tipo_gasto: TipoGasto.FIJO,
      usuario: (await this.authService.getCurrentUser())?.uid || 'desconocido',
      fecha_actualizacion: new Date()
    };

    try {
      await this.gastoService.crearGasto(nuevoGasto);
      this.limpiarFormulario();
    }
    catch (error) {
      console.error('Error al crear el gasto fijo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error al crear el gasto fijo.',
        confirmButtonColor: '#3B82F6'
      });
    }
  }

  limpiarFormulario() {
    this.formularioData = {
      categoria: '',
      nombre: '',
      monto: 0
    };
    this.gastoEnEdicion.set(null);
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

      this.gastosFijos.update(gastos =>
        gastos.filter(gasto =>
          !this.gastosSeleccionadosArr().some(sel => sel.id === gasto.id)
        )
      );
      this.gastosSeleccionadosArr.set([]);
      this.trashHide.set(true);
    });
  }

  editarGastoSeleccionado(gasto: Gasto) {
    // Aquí puedes implementar la lógica para editar el gasto seleccionado
    console.log('Editar gasto seleccionado:', gasto);

    this.formularioData = {
      categoria: gasto.categoria_gasto,
      nombre: gasto.name,
      monto: gasto.monto
    };

    this.gastoEnEdicion.set(gasto);
  }
}
