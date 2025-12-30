import { Contacto } from "./Contacto";
import { Usuario } from "./Usuario";

export interface ContactoConUsuario extends Contacto {
  usuarioData: Usuario;
}
