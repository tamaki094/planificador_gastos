export interface Montos {
  id?: string;                 // ID del documento (opcional para creación)
  ahorro: number;              // Cantidad destinada a ahorro
  play: number;                // Cantidad destinada a entretenimiento
  provisiones: number;         // Cantidad destinada a provisiones
  gastos_vivir: number;        // Cantidad destinada a gastos para vivir
  usuario: string;             // ID o nombre del usuario
  fecha_creacion: Date;        // Timestamp convertido a Date
  fecha_actualizacion: Date;   // Fecha de actualización del gasto
}
