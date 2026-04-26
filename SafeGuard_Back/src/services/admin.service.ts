import { prisma } from '../config/db';

export const obtenerDatosPanelAdmin = async () => {
  const solicitudesPendientes = await prisma.solicitud.findMany({ where: { estado: 'Pendiente' } });
  const vigilantes = await prisma.usuario.findMany({ where: { rol: 'Vigilante' } });
  
  return { solicitudesPendientes, vigilantes };
};

export const asignarVigilante = async (solicitudId: string, vigilanteId: string) => {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });
  if (!solicitud) throw new Error('404: Solicitud no encontrada');

  const vigilante = await prisma.usuario.findUnique({ where: { id: vigilanteId } });
  if (!vigilante) throw new Error('404: Vigilante no encontrado');

  const cruceHorario = await prisma.turno.findFirst({
    where: { 
      vigilanteId: vigilanteId, 
      horaInicio: solicitud.horaInicio 
    }
  });
  
  if (cruceHorario) throw new Error('400: Vigilante Ocupado. Ya tiene un turno asignado en esa fecha y hora.');

  // Transacción Pro-Code: Actualizamos solicitud y creamos turno al mismo tiempo
  const [, nuevoTurno] = await prisma.$transaction([
    prisma.solicitud.update({
      where: { id: solicitudId },
      data: { estado: 'Asignado' }
    }),
    prisma.turno.create({
      data: {
        vigilanteId: vigilante.id,
        horaInicio: solicitud.horaInicio,
        horaFinEstimada: solicitud.horaFin,   // <-- Hereda la hora oficial
        latitudPuesto: solicitud.latitud,     // <-- Usa la del cliente
        longitudPuesto: solicitud.longitud,   // <-- Usa la del cliente
        estado: 'Pendiente'
      }
    })
  ]);

  return nuevoTurno;
};