import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { ContactoConUsuario, Mensaje } from '../../interfaces';
import { MensajesService } from '../../services/Mensajes.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { UsuarioService } from '../../services/Usuario.service';
import { AuthService } from '../../services/Auth.service';

@Component({
  selector: 'chat-item',
  imports: [AsyncPipe, DatePipe, CommonModule],
  templateUrl: './chat-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatItemComponent implements OnInit {
  @Input() contacto!: ContactoConUsuario;
  @Input() usuarioLogeado!: string;

  _mensajesService = inject(MensajesService);
  _authService = inject(AuthService);

  nombreAmigo = signal<string>("Juanito Banana");
  nombreLogeado = signal<string>("Miah Kalifa");


  mensajes$!: Observable<Mensaje[]>;


  async ngOnInit(): Promise<void> {
    console.log('Contacto recibido en ChatItemComponent:', this.contacto);

    this.cargarMensajes(this.contacto.amigo);
  }

  async cargarMensajes(amigo: string) {
    // //TODO: Obtener el nombre de los usuarios, no cargar en cada mensaje, no tiene caso cargar el nombre de usuairo en cada mensaje si ya sabemos que cada chat solo hay un "de" y un "para"
    // console.log('Cargando mensajes del amigo:', amigo);
    // (await this._mensajesService.getMensajesPorAmigo(this.contacto.usuario, amigo)).subscribe(
    //   (      mensajes: Mensaje[]) => {
    //     this.mensajes$ = of(mensajes);
    //     console.log('Mensajes recibidos para amigo', amigo, ':', mensajes);
    //   },
    //   (      error: any) => {
    //     console.error('Error al cargar mensajes para amigo', amigo, ':', error);
    //   }
    // );

    this.mensajes$ = await this._mensajesService.getMensajesPorAmigo(this.contacto.usuario, amigo);
  }

  formatearFecha(fechaAny: any): Date | null {
    if (!fechaAny) return null;

    // Si es un Timestamp de Firestore, usamos .toDate()
    if (fechaAny && typeof fechaAny.toDate === 'function') {
      return fechaAny.toDate();
    }

    // Por si ya fuera un Date o un string ISO
    return new Date(fechaAny);
  }

  enviarMensaje(mensaje : string){
    this._mensajesService.enviarMensaje(mensaje, this.contacto.usuario, this.contacto.amigo)
      .then((fueExitoso) => {
        if(fueExitoso){
          console.log("Mensaje enviado");
        }
      })
      .catch((error) => {
        console.error("Fallo el envio de mensaje a Firebase:" + error);
        alert("Hubo un error al intentar enviar");
      })



  }
}
