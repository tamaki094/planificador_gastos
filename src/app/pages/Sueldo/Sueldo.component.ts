import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgForm, FormsModule} from '@angular/forms'
import { SueldoService } from '../../services/Sueldo.service';
import { Sueldo } from '../../interfaces';
import { AuthService } from '../../services/Auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sueldo',
  imports: [CommonModule, FormsModule],
  templateUrl: './Sueldo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SueldoComponent {
  sueldo_monto: number = 12000;
  sueldoService = inject(SueldoService);
  authService = inject(AuthService);;

  async guardarSueldo() {
    const su: Sueldo = {
      usuario: (await this.authService.getCurrentUser()?.uid) || 'desconocido',
      sueldo: this.sueldo_monto,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    };
    console.log('Sueldo guardado:', this.sueldo_monto);
    if(await this.sueldoService.guardarSueldo(su)){
      Swal.fire({
        icon: 'success',
        title: 'Sueldo guardado',
        text: 'El sueldo ha sido guardado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar el sueldo',
        text: 'El sueldo no pudo ser guardado o ya existe.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

}
