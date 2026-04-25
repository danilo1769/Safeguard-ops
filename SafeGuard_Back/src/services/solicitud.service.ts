import { prisma } from '../config/db';

export const crearSolicitud = async (datos: { clienteId: string, ubicacion: string, horaInicio: string }) => {
  const fechaInicio = new Date(datos.horaInicio);
  const ahora = new Date();

  if (fechaInicio < ahora) {
    throw new Error('400: La fecha de inicio no puede estar en el pasado');
  }

  // Insertar en SQLite
  const nuevaSolicitud = await prisma.solicitud.create({
    data: {
      clienteId: datos.clienteId,
      ubicacion: datos.ubicacion,
      horaInicio: fechaInicio,
      estado: 'Pendiente'
    }
  });

  return nuevaSolicitud;
};

export const obtenerSolicitudesPorCliente = async (clienteId: string) => {
  // Buscar en SQLite
  return await prisma.solicitud.findMany({
    where: { clienteId: clienteId }
  });
};