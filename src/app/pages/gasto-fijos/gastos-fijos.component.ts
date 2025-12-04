import { ChangeDetectionStrategy, Component, inject, OnInit, Signal, signal } from '@angular/core';
import { AuthService } from '../../services/Auth.service';
import { Observable } from 'rxjs';
import { User, getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { CategoriaService } from '../../services/Categoria.service';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule} from '@angular/forms'
import { Gasto, TipoGasto, Categoria } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gastos-fijos',
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos-fijos.component.html',
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
  modalVisible = signal(false);
  calculoResultado = signal<number>(0);
  entradaValida = signal<boolean>(true);
  mensajeError = signal<string>('');


  formularioData = {
    categoria: '',
    nombre: '',
    monto: 0,
    fecha_vencimiento: null as Date | null,
    fecha_recordatorio: null as Date | null
  };


  ngOnInit() : void {
    this.user.subscribe(user => {
      if(user){
        console.log('🔍 Auth state changed in GastosFijosComponent:', user);

        this.gastoService.getAllGastos(1).subscribe((gastos : Gasto[])=> {
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
      this.gastosSeleccionadosArr.update(gastos => [...gastos, gasto]);
      this.trashHide.set(false);
    }
    else {
      this.gastosSeleccionadosArr.update(gastos =>
        gastos.filter(g => g.id !== gasto.id)
      );

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
      fecha_actualizacion: new Date(),
      fecha_vencimiento: formData.fecha_vencimiento ? new Date(formData.fecha_vencimiento) : undefined
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
      monto: 0,
      fecha_vencimiento: null,
      fecha_recordatorio: null
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
      monto: gasto.monto,
      fecha_vencimiento: gasto.fecha_vencimiento || null,
      fecha_recordatorio: gasto.fecha_recordatorio || null
    };

    this.gastoEnEdicion.set(gasto);
  }

  todayString(): Date|null {
    return new Date();
  }



  abrirModal() {
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
  }

  confirmarAccion() {
    console.log('Acción confirmada');
    this.formularioData.monto = this.calculoResultado();
    this.cerrarModal();
  }

  calcularGasto(expresion: string) {
    if (!this.entradaValida()) {
      console.warn('Expresión no válida:', expresion);
      return;
    }

    try {
      // ✅ Limpiar y preparar la expresión
      const expresionLimpia = this.prepararExpresion(expresion);

      // ✅ Evaluar de forma segura
      const resultado = this.evaluarExpresionSegura(expresionLimpia);

      if (resultado !== null) {
        // ✅ Redondear a 2 decimales
        const resultadoRedondeado = Math.round(resultado * 100) / 100;

        this.calculoResultado.set(resultadoRedondeado);

        // ✅ Actualizar el formulario automáticamente
        this.formularioData.monto = resultadoRedondeado;

        console.log('✅ Cálculo exitoso:', `${expresion} = ${resultadoRedondeado}`);

        // ✅ Mensaje de éxito opcional
        this.mensajeError.set(`✅ Resultado: ${resultadoRedondeado}`);

      } else {
        throw new Error('Resultado inválido');
      }

    }
    catch (error) {
      console.error('❌ Error al calcular:', error);

      this.calculoResultado.set(0);
      this.mensajeError.set('❌ Error en la expresión matemática');

      // ✅ Opcional: limpiar después de 3 segundos
      setTimeout(() => {
        if (this.mensajeError().includes('Error')) {
          this.mensajeError.set('');
        }
      }, 3000);
    }
  }

  // ✅ Función para limpiar y preparar la expresión
  private prepararExpresion(expresion: string): string {
    return expresion
      .replace(/\s+/g, '') // Quitar espacios
      .replace(/,/g, '.')  // Convertir comas a puntos
      .toLowerCase();      // Normalizar texto
  }

  // ✅ Evaluación segura de la expresión
  private evaluarExpresionSegura(expresion: string): number | null {
    try {
      // ✅ Validación final estricta
      if (!/^[0-9+\-*/().]+$/.test(expresion)) {
        throw new Error('Caracteres no permitidos después de limpiar');
      }

      // ✅ Validar que no esté vacía
      if (!expresion || expresion.length === 0) {
        throw new Error('Expresión vacía');
      }

      // ✅ Usar Function constructor de forma controlada
      const resultado = new Function('"use strict"; return (' + expresion + ')')();

      // ✅ Validar que el resultado sea un número válido
      if (typeof resultado !== 'number' || isNaN(resultado) || !isFinite(resultado)) {
        throw new Error('Resultado no es un número válido');
      }

      return resultado;

    }
    catch (error) {
      console.error('Error en evaluación segura:', error);
      return null;
    }
  }

  validarCaracteres(entrada: string): boolean {
    // Expresión regular que permite:
    // - Números (0-9)
    // - Operadores básicos (+, -, *, /)
    // - Punto decimal (.)
    // - Espacios en blanco
    // - Paréntesis para agrupación
    const regex = /^[0-9+\-*/().\s]*$/;

    const esValido = regex.test(entrada);

    // Actualizar estado
    this.entradaValida.set(esValido);

    if (!esValido) {
      this.mensajeError.set('⚠️ Solo se permiten números y operadores matemáticos');
    } else {
      this.mensajeError.set('');
    }

    return esValido;
  }
}
