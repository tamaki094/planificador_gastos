import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, Signal } from '@angular/core';
import { NgForm, FormsModule} from '@angular/forms'
import { SueldoService } from '../../services/Sueldo.service';
import { Sueldo } from '../../interfaces';
import { AuthService } from '../../services/Auth.service';
import Swal from 'sweetalert2';
import { map, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sueldo',
  imports: [CommonModule, FormsModule],
  templateUrl: './Sueldo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SueldoComponent implements OnInit {

  sueldo_monto = signal<number>(2000);
  sueldoService = inject(SueldoService);
  authService = inject(AuthService);
  userId: string | undefined = undefined;
  btnLabel = signal<string>('Guardar Sueldo');

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    this.userId = user?.uid;

    if (this.userId) {
      try {
        // ✅ CORRECTO: Convertir Observable a Promise
        const sueldo = await firstValueFrom(
          this.sueldoService.getSueldoByUser(this.userId)
        );

        if (sueldo) {
          this.sueldo_monto.set(sueldo.sueldo);
          this.btnLabel.set('Actualizar Sueldo');
        }
        else {
          console.log('No se encontró sueldo para el usuario');
        }
      } catch (error) {
        console.error('Error al obtener sueldo:', error);
      }
    }
  }

  async guardarSueldo() {
    const su: Sueldo = {
      usuario: (await this.authService.getCurrentUser()?.uid) || 'desconocido',
      sueldo: this.sueldo_monto(),
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
