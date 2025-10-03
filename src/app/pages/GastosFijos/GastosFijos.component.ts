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

  gastosSeleccionados = signal<number>(0);

  ngOnInit() : void{
    this.user.subscribe(user => {
      if(user){
        console.log('🔍 Auth state changed in GastosFijosComponent:', user);

        this.gastoService.getAllGastos().subscribe((gastos : Gasto[])=> {
          console.log('Gastos obtenidos:', gastos);
          this.gastosFijos.set(gastos);
          this.gastosSeleccionados.set(gastos.length);
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

  onGastoSelect(gasto: Gasto,$event: Event) {
    this.gastosSeleccionados.set($event ? (this.gastosSeleccionados() + 1) : (this.gastosSeleccionados() - 1));

    if(this.gastosSeleccionados() === 0){
      console.log('No hay gastos seleccionados, ocultando ícono de basura');
      this.trashHide.set(true);
    }
    else{
      console.log('Gastos seleccionados:', this.gastosSeleccionados());
      this.trashHide.set(false);
    }
  }

  async onSubmit(form: NgForm) {
    console.log('Formulario enviado:', form.value);
    if(form.valid){
      const formData = form.value;

      const nuevoGasto : Omit<Gasto, 'id'> ={
        categoria_gasto : formData.categoria,
        fecha_creacion : new Date(),
        monto : parseFloat(formData.monto),
        name : formData.nombre,
        tipo_gasto: TipoGasto.FIJO
      };

      try{
        await this.gastoService.crearGasto(nuevoGasto);
        console.log('Gasto fijo creado exitosamente:', nuevoGasto);
        form.resetForm();
      }
      catch(error){
        console.error('Error al crear el gasto fijo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error al crear el gasto fijo.',
          confirmButtonColor: '#3B82F6'
        });
      }
    }
  }

}
