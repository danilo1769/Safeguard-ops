// Definimos exactamente cómo es un Usuario en el sistema
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string; 
  rol: 'Administrativo' | 'Contratante' | 'Vigilante';
}

// Nuestra "Base de Datos" temporal en memoria
export const usuariosDB: Usuario[] = [];

// Estructura de un Turno de Guardia
export interface Turno {
  id: string;
  vigilanteId: string;
  latitudPuesto: number;
  longitudPuesto: number;
  estado: 'Pendiente' | 'Completado' | 'En turno';
}

// Simulamos que al vigilante ya se le asignó un turno
export const turnosDB: Turno[] = [
  {
    id: "TURNO-001",
    vigilanteId: "aqui-iria-el-id-del-vigilante", // En la vida real lo asociamos
    latitudPuesto: 6.1605,  // Ejemplo: Coordenadas de Envigado (IUE)
    longitudPuesto: -75.5814,
    estado: 'Pendiente'
  }
];

export interface Solicitud {
  id: string;
  clienteId: string;
  ubicacion: string;
  horaInicio: string; // ISO String (ej. "2026-03-18T08:00")
  estado: 'Pendiente' | 'Asignado' | 'Expirado';
}

export const solicitudesDB: Solicitud[] = [];