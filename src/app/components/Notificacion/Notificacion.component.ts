import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Gasto } from '../../interfaces';
import { CurrencyPipe , DatePipe } from '@angular/common';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { AuthService } from '../../services/Auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'notificacion-item',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './Notificacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionComponent {
  @Input() gasto!: Gasto;
  authService = inject(AuthService);

  getImage() {
    switch(this.gasto.categoria_gasto) {
      case 'alimentacion':
        return 'comida.svg';
      case 'transporte':
        return 'bus.svg';
      case 'entretenimiento':
        return 'entretenimiento.svg';
      case 'salud':
        return 'salud.svg';
      case 'educacion':
        return 'educacion.svg';
      case 'mascotas':
        return 'mascotas.svg';
      case 'vivienda':
        return 'casa.svg';
      case 'servicios':
        return 'servicios.svg';
      case 'extra':
        return 'otros.svg';
      default:
        return 'default.svg';
    }
  }

  crearNotificacion() {
    if((!this.gasto.fecha_recordatorio || this.gasto.fecha_recordatorio === null || this.gasto.fecha_recordatorio === undefined) && (!this.gasto.fecha_vencimiento || this.gasto.fecha_vencimiento === null || this.gasto.fecha_vencimiento === undefined)) {
      alert('El gasto no tiene fecha de recordatorio ni fecha de vencimiento.');
      return;
    }
    else
    {
      const fechaInicio = this.gasto.fecha_recordatorio!.toISOString();
      const fechaFin = new Date(
        this.gasto.fecha_recordatorio!.getTime() + 60 * 60 * 1000
      ).toISOString();
      const montoFormateado = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.gasto.monto);

      let eventoData;

      eventoData = {
        summary: `💳 PAGO MENSUAL: ${this.gasto.name} - ${montoFormateado}`,
        description: `💰 Monto: ${montoFormateado}\n📋 Tipo: ${this.gasto.tipo_gasto === 1 ? 'Gasto Fijo' : 'Gasto Variable'}\n📂 Categoría: ${this.gasto.categoria_gasto}\n⏰ Pago mensual hasta: ${this.gasto.fecha_vencimiento!.toLocaleDateString('es-MX')}`,
        start: {
          dateTime: this.gasto.fecha_recordatorio!.toISOString(),
          timeZone: 'America/Mexico_City'
        },
        end: {
          dateTime: new Date(this.gasto.fecha_recordatorio!.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Mexico_City'
        },
        recurrence: [
          `RRULE:FREQ=MONTHLY;UNTIL=${this.gasto.fecha_vencimiento!.toISOString().split('T')[0].replace(/-/g, '')}`
        ],

        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24 horas antes
            { method: 'popup', minutes: 60 }    // 1 hora antes
          ]
        }
      };

      return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authService.accesToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventoData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
      })
      .then(data => {
        Swal.fire({
          title: '✅ ¡Recordatorios creados!',
          html: `Se crearon recordatorios mensuales para <strong>${this.gasto.name}</strong><br>
                📅 Cada día ${this.gasto.fecha_recordatorio?.toLocaleDateString('es-MX')} del mes<br>
                ⏰ Hasta: ${this.gasto.fecha_vencimiento?.toLocaleDateString('es-MX')}`,
          icon: 'success'
        });
      })
      .catch(error => {
        console.error('❌ Error:', error);
        Swal.fire('Error', 'No se pudo crear el recordatorio: ' + error.message, 'error');
      });
    }
  }
}
