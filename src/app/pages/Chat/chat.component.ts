import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ContactoService } from '../../services/Contacto.service';
import { Contacto, ContactoConUsuario, Usuario } from '../../interfaces';
import { AuthService } from '../../services/Auth.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatItemComponent } from '../../components/chat-item/chat-item.component';

@Component({
  selector: 'chat',
  imports: [DatePipe, FormsModule, ChatItemComponent],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent implements OnInit {

  authService = inject(AuthService);
  contactoService = inject(ContactoService);
  contactos = signal<Contacto[]>([]);
  contactosConUsuario = signal<ContactoConUsuario[]>([]);
  userId : string | null = null;
  contactoSeleccionado = signal<ContactoConUsuario | null>(null);

  modalAbierto = signal(false);
  emailBusqueda = signal('');
  usuarioEncontrado = signal<Usuario | null>(null);
  buscandoUsuario = signal(false);
  searchContactos = signal('');


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

  contactosFiltrados = computed(() => {
    const term = this.searchContactos().toLowerCase();
    if (!term) return this.contactosConUsuario();

    return this.contactosConUsuario().filter(contacto =>
      contacto.usuarioData.nombre.toLowerCase().includes(term) ||
      contacto.usuarioData.correo.toLowerCase().includes(term)
    );
  });

  // ✅ Buscar usuario por email
  async buscarUsuario() {

    const email = this.emailBusqueda().trim();

    console.log('🔍 Buscando usuario con email:', email); // ✅ Debug

    if (email.length < 3) {
      this.usuarioEncontrado.set(null);
      return;
    }

    this.buscandoUsuario.set(true);

    try {
      const usuario = await this.contactoService.buscarUsuarioPorEmail(email);
      console.log('👤 Usuario encontrado:', usuario); // ✅ Debug
      this.usuarioEncontrado.set(usuario);
    } catch (error) {
      console.error('❌ Error buscando usuario:', error);
      this.usuarioEncontrado.set(null);
    } finally {
      this.buscandoUsuario.set(false);
    }
  }

  // ✅ MÉTODO PARA BUSCAR CONTACTOS EXISTENTES (sidebar)
  buscarContactosExistentes(event: any) {
    this.searchContactos.set(event.target.value);
    console.log('🔍 Filtrando contactos con término:', event.target.value);
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

  seleccionarContacto(contacto: ContactoConUsuario) {
    this.contactoSeleccionado.set(contacto);
  }


}
