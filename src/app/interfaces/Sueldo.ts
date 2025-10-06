export interface Sueldo {
  id?: string;                    // ID del documento (opcional para creación)
  sueldo: number;                 // Cantidad del sueldo
  fecha_creacion: Date;          // Timestamp convertido a Date
  usuario: string;
  fecha_actualizacion: Date; // Fecha de actualización del sueldo
}
