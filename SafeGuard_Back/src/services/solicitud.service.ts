import { prisma } from '../config/db';

export const crearSolicitud = async (datos: { clienteId: string, ubicacion: string, horaInicio: string, horaFin: string, latitud: number, longitud: number }) => {
  if (!datos.clienteId) throw new Error('400: Error de sesión.');

  const fechaInicio = new Date(datos.horaInicio);
  const fechaFin = new Date(datos.horaFin); 
  const ahora = new Date();

  if (fechaInicio < ahora) throw new Error('400: La fecha de inicio no puede estar en el pasado');
  
  if (fechaFin <= fechaInicio) throw new Error('400: La fecha de fin debe ser posterior a la de inicio');

  const nuevaSolicitud = await prisma.solicitud.create({
    data: {
      clienteId: datos.clienteId,
      ubicacion: datos.ubicacion,
      latitud: datos.latitud,   
      longitud: datos.longitud, 
      horaInicio: fechaInicio,
      horaFin: fechaFin,       
      estado: 'Pendiente'
    }
  });
  return nuevaSolicitud;
};

export const obtenerSolicitudesPorCliente = async (clienteId: string) => {

  return await prisma.solicitud.findMany({
    where: { clienteId: clienteId },
    include: { turno: true }
  });
};