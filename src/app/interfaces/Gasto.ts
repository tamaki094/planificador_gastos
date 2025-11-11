export interface Gasto {
  id?: string;                    // ID del documento (opcional para creación)
  categoria_gasto: string;        // ID o nombre de la categoría
  fecha_creacion: Date;          // Timestamp convertido a Date
  monto: number;                 // Cantidad del gasto
  name: string;                  // Nombre/descripción del gasto
  tipo_gasto: number;       // Tipo de gasto (1: fijo, 2: variable)
  usuario: string;
  fecha_actualizacion: Date; // Fecha de actualización del gasto
  fecha_vencimiento?: Date;    // Fecha de vencimiento (opcional)
}
