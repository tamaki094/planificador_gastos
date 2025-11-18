import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

@Component({
  selector: 'app-notificaciones.component',
  imports: [],
  templateUrl: './Notificaciones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificacionesComponent {

  pruebaGoogleCalendar() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');

    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        if (!accessToken) {
          console.error('No se obtuvo el access token. Revisa los scopes.');
          return;
        }

        console.log('Access Token:', accessToken);

        return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: 'Reunión importante',
            start: { dateTime: '2025-11-13T10:00:00-06:00', timeZone: 'America/Mexico_City' },
            end: { dateTime: '2025-11-13T11:00:00-06:00', timeZone: 'America/Mexico_City' },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 30 },
                { method: 'popup', minutes: 10 }
              ]
            }
          })
        });
      })
      .then(response => response?.json())
      .then(data => console.log('Evento creado:', data))
      .catch(error => console.error('Error en login o creación de evento:', error));
  }
}
