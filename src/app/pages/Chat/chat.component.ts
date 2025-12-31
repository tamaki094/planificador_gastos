import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ContactoService } from '../../services/Contacto.service';
import { Contacto, ContactoConUsuario, Usuario } from '../../interfaces';
import { AuthService } from '../../services/Auth.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'chat',
  imports: [DatePipe, FormsModule],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent implements OnInit {

  authService = inject(AuthService);
  contactoService = inject(ContactoService);
  contactos = signal<Contacto[]>([]);
  contactosConUsuario = signal<ContactoConUsuario[]>([]);
  userId : string | null = null;

  modalAbierto = signal(false);
  emailBusqueda = signal('');
  usuarioEncontrado = signal<Usuario | null>(null);
  buscandoUsuario = signal(false);


  async ngOnInit() {
    this.userId = this.authService.getCurrentUserUID();

    this.contactoService.getContactosWithUserDataInnerJoin(this.userId!).subscribe(
      (contactosConDatosUsuario: ContactoConUsuario[]) => {
        this.contactosConUsuario.set(contactosConDatosUsuario);
      }
    );

  }

  // ✅ Abrir modal
  abrirModal() {
    this.modalAbierto.set(true);
    this.emailBusqueda.set('');
    this.usuarioEncontrado.set(null);
  }

  // ✅ Cerrar modal
  cerrarModal() {
    this.modalAbierto.set(false);
    this.emailBusqueda.set('');
    this.usuarioEncontrado.set(null);
  }

  // ✅ Buscar usuario por email
  async buscarUsuario(event? : KeyboardEvent) {

    const email = this.emailBusqueda().trim() || 'sin email';

    console.log('Buscando usuario por email...' + email);

    if (email.length < 3) {
      this.usuarioEncontrado.set(null);
      return;
    }

    this.buscandoUsuario.set(true);

    try {
      // Aquí usas tu ContactoService para buscar por email
      const usuario = await this.contactoService.buscarUsuarioPorEmail(email);
      this.usuarioEncontrado.set(usuario);

      if (!usuario) {
        if(event && event.key === 'Enter') {
          this.abrirModal();
        }

      }
    } catch (error) {
      console.error('Error buscando usuario:', error);
      this.usuarioEncontrado.set(null);
    } finally {
      this.buscandoUsuario.set(false);
    }
  }

  // ✅ Agregar amigo
  async agregarAmigo() {
    const usuario = this.usuarioEncontrado();
    if (!usuario) return;

    try {
      await this.contactoService.agregarContacto(usuario.uid, usuario.nombre, usuario.correo);

      // Mostrar success
      this.cerrarModal();
      this.loadContactos(); // Recargar lista

    } catch (error) {
      console.error('Error agregando amigo:', error);
    }
  }
  loadContactos() {
    throw new Error('Method not implemented.');
  }


}
