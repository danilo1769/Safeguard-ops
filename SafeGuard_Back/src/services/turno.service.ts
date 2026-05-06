import { prisma } from '../config/db';
import { calcularDistanciaHaversine } from '../utils/geo'; 

export const registrarClockOut = async (turnoId: string, latVigilante: number, lngVigilante: number) => {
  const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
  if (!turno) throw new Error('404: Turno no encontrado');
  if (turno.estado !== 'En turno') throw new Error('400: No puedes finalizar un turno que no ha iniciado.');

  const horaSalida = new Date();

  if (horaSalida < new Date(turno.horaFinEstimada)) {
    throw new Error('403: No puedes abandonar tu puesto. Tu turno aún no ha terminado.');
  }

  const distancia = calcularDistanciaHaversine(latVigilante, lngVigilante, turno.latitudPuesto, turno.longitudPuesto);
  if (distancia > 100) {
    throw new Error(`403: Fraude detectado. Estás a ${Math.round(distancia)}m del puesto. Debes marcar salida en tu lugar de trabajo.`);
  }

  const diferenciaMs = horaSalida.getTime() - new Date(turno.horaInicio).getTime();
  const horasEfectivas = Math.round((diferenciaMs / (1000 * 60 * 60)) * 100) / 100;

  return await prisma.turno.update({
    where: { id: turnoId },
    data: { estado: 'Completado', horaFin: horaSalida, horasEfectivas }
  });
};

export const obtenerTurnosVigilante = async (vigilanteId: string) => {
  return await prisma.turno.findMany({
    where: { vigilanteId: vigilanteId },
    orderBy: { horaInicio: 'asc' } 
  });
};

export const reportarAusencia = async (turnoId: string) => {
  const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
  if (!turno) throw new Error('404: Turno no encontrado');

  if (turno.estado !== 'Pendiente') {
    throw new Error('400: El turno ya fue atendido o completado.');
  }

  const ahora = new Date();
  const QUINCE_MINUTOS = 15 * 60 * 1000;
  const tiempoTranscurrido = ahora.getTime() - new Date(turno.horaInicio).getTime();

  if (tiempoTranscurrido < QUINCE_MINUTOS) {
    throw new Error('403: Aún no han pasado 15 minutos de gracia. Por favor, espera.');
  }

  return await prisma.turno.update({
    where: { id: turnoId },
    data: { estado: 'Ausencia Reportada' }
  });
};