import { prisma } from '../config/db';

export const crearSolicitud = async (datos: { clienteId: string, ubicacion: string, horaInicio: string, horaFin: string, latitud: number, longitud: number }) => {
  if (!datos.clienteId) throw new Error('400: Error de sesión.');

  const fechaInicio = new Date(datos.horaInicio);
  const fechaFin = new Date(datos.horaFin); // NUEVO
  const ahora = new Date();

  if (fechaInicio < ahora) throw new Error('400: La fecha de inicio no puede estar en el pasado');
  
  // REGLA NUEVA: El turno no puede terminar antes de empezar
  if (fechaFin <= fechaInicio) throw new Error('400: La fecha de fin debe ser posterior a la de inicio');

  const nuevaSolicitud = await prisma.solicitud.create({
    data: {
      clienteId: datos.clienteId,
      ubicacion: datos.ubicacion,
      latitud: datos.latitud,   // NUEVO
      longitud: datos.longitud, // NUEVO
      horaInicio: fechaInicio,
      horaFin: fechaFin,        // NUEVO
      estado: 'Pendiente'
    }
  });
  return nuevaSolicitud;
};

export const obtenerSolicitudesPorCliente = async (clienteId: string) => {
  // Buscar en SQLite
  return await prisma.solicitud.findMany({
    where: { clienteId: clienteId },
    include: { turno: true }
  });
};