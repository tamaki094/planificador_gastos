export interface Usuario {
  uid: string,
  nombre: string,
  correo: string,
  foto_url: string,
  telefono: string,
  email_verificado: boolean,
  proveedor: string,
  fecha_creacion: Date,
  ultimo_login: Date,
  estatus_activo: true,
  fecha_actualizacion: Date

}
