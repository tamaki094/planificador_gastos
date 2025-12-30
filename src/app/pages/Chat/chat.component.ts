import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ContactoService } from '../../services/Contacto.service';
import { Contacto } from '../../interfaces';
import { AuthService } from '../../services/Auth.service';

@Component({
  selector: 'chat',
  imports: [],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent implements OnInit {

  authService = inject(AuthService);
  contactoService = inject(ContactoService);
  contactos = signal<Contacto[]>([]);
  userId : string | null = null;


  async ngOnInit() {
    this.userId = this.authService.getCurrentUserUID();

    this.contactoService.getContactosByUser(this.userId!).subscribe(
      (contactos: Contacto[]) => {
        this.contactos.set(contactos);
        console.log('Contactos obtenidos:', contactos);
      }
    );

    this.contactoService.getContactosWithUserDataInnerJoin(this.userId!).subscribe(
      (contactosConDatosUsuario: any[]) => {
        console.log('Contactos con datos de usuario obtenidos:', contactosConDatosUsuario);
      }
    );

  }


}
