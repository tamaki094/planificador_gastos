import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Gasto } from '../../interfaces';
import { CurrencyPipe , DatePipe } from '@angular/common';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { AuthService } from '../../services/Auth.service';


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

    console.log(this.gasto );//creo el error es q en el service de get gastos le estoy asignando una fecha por defecto si en firebase no tiene fecha de recordatorio
    if(!this.gasto.fecha_recordatorio || this.gasto.fecha_recordatorio === null || this.gasto.fecha_recordatorio === undefined) {
      alert('El gasto no tiene fecha de recordatorio.');
      return;
    }

    console.log(this.authService.accesToken);

    const fechaInicio = this.gasto.fecha_recordatorio.toISOString();
    const fechaFin = new Date(
      this.gasto.fecha_recordatorio.getTime() + 60 * 60 * 1000
    ).toISOString();
    const montoFormateado = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.gasto.monto);

    return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authService.accesToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: `GASTO: ${this.gasto.name} - ${montoFormateado}`,
        start: { dateTime: fechaInicio, timeZone: 'America/Mexico_City' },
        end: { dateTime: fechaFin, timeZone: 'America/Mexico_City' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 30 },
            { method: 'popup', minutes: 10 }
          ]
        }
      })
    }).then(response => response?.json())
      .then(data => console.log('Evento creado:', data))
      .catch(error => console.error('Error en login o creación de evento:', error));
  }
}
