import { prisma } from '../config/db';

export const obtenerDatosPanelAdmin = async () => {
  const solicitudes = await prisma.solicitud.findMany({
    include: { 
      turno: { 
        include: { vigilante: true } // El "Join" de SQL para ver el nombre del guardia
      } 
    },
    orderBy: { createdAt: 'desc' } // Los más recientes primero
  });
  
  const vigilantes = await prisma.usuario.findMany({ where: { rol: 'Vigilante' } });
  
  return { solicitudes, vigilantes }; // Cambiamos el nombre de la variable de retorno
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
        horaFinEstimada: solicitud.horaFin,   
        latitudPuesto: solicitud.latitud,     
        longitudPuesto: solicitud.longitud,  
        estado: 'Pendiente'
      }
    })
  ]);
  return nuevoTurno;
};

export const generarReporteNominaCSV = async () => {
  const turnosCompletados = await prisma.turno.findMany({
    where: { estado: 'Completado' },
    include: { vigilante: true }
  });

  if (turnosCompletados.length === 0) {
    throw new Error('404: No hay turnos completados para generar el reporte.');
  }

  let csvString = 'ID Turno,Guardia,Email,Fecha Inicio,Fecha Fin,Horas Efectivas\n';

  turnosCompletados.forEach(turno => {
    const fechaIn = new Date(turno.horaInicio).toLocaleString();
    const fechaOut = turno.horaFin ? new Date(turno.horaFin).toLocaleString() : 'N/A';
    const horas = turno.horasEfectivas || 0;

    csvString += `${turno.id},${turno.vigilante.nombre},${turno.vigilante.email},${fechaIn},${fechaOut},${horas}\n`;
  });

  return csvString;
};