import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ContactoConUsuario } from '../../interfaces';

@Component({
  selector: 'chat-item',
  imports: [],
  templateUrl: './chat-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatItemComponent implements OnInit {
  @Input() contacto!: ContactoConUsuario;

  async ngOnInit(): Promise<void> {
    console.log('Contacto recibido en ChatItemComponent:', this.contacto);

    this.cargarMensajes(this.contacto.amigo);
  }
  cargarMensajes(amigo: string) {
    console.log('Cargando mensajes del amigo:', amigo);


  }


}
