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
        solicitudId: solicitudId,
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

export const generarReporteNominaCSV = async () => {
  // Buscamos todos los turnos completados, incluyendo los datos del vigilante
  const turnosCompletados = await prisma.turno.findMany({
    where: { estado: 'Completado' },
    include: { vigilante: true }
  });

  if (turnosCompletados.length === 0) {
    throw new Error('404: No hay turnos completados para generar el reporte.');
  }

  // 1. Creamos las cabeceras del archivo Excel/CSV
  let csvString = 'ID Turno,Guardia,Email,Fecha Inicio,Fecha Fin,Horas Efectivas\n';

  // 2. Llenamos las filas con los datos
  turnosCompletados.forEach(turno => {
    const fechaIn = new Date(turno.horaInicio).toLocaleString();
    const fechaOut = turno.horaFin ? new Date(turno.horaFin).toLocaleString() : 'N/A';
    const horas = turno.horasEfectivas || 0;

    // Concatenamos separando por comas
    csvString += `${turno.id},${turno.vigilante.nombre},${turno.vigilante.email},${fechaIn},${fechaOut},${horas}\n`;
  });

  return csvString;
};