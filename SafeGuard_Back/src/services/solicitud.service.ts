import { solicitudesDB, type Solicitud } from '../config/db';

export const crearSolicitud = async (datos: Omit<Solicitud, 'id' | 'estado'>) => {
  const fechaInicio = new Date(datos.horaInicio);
  const ahora = new Date();

  // Cumplimiento Estricto del PDF (Pág 3)
  if (fechaInicio < ahora) {
    throw new Error('400: La fecha de inicio no puede estar en el pasado');
  }

  const nuevaSolicitud: Solicitud = {
    id: `SOL-${Date.now()}`,
    ...datos,
    estado: 'Pendiente' // Regla del PDF: Entra por defecto como Pendiente
  };

  solicitudesDB.push(nuevaSolicitud);
  return nuevaSolicitud;
};

// Función extra para que el cliente vea sus solicitudes
export const obtenerSolicitudesPorCliente = async (clienteId: string) => {
  return solicitudesDB.filter(sol => sol.clienteId === clienteId);
};