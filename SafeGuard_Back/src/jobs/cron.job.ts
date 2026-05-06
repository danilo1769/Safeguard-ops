import { prisma } from '../config/db';

let robotInterval: NodeJS.Timeout | null = null;

export const iniciarCronJobs = () => {
  if (robotInterval) {
    console.warn('⚠️ Intento de iniciar múltiples robots bloqueado.');
    return;
  }

  console.log('🤖 Auditoría nativa inicializada (Zero Dependencies)...');
  const CINCO_MINUTOS = 5 * 60 * 1000;

  robotInterval = setInterval(async () => {
    try {
      const ahora = new Date();
      const solicitudesVencidas = await prisma.solicitud.findMany({
        where: { estado: 'Pendiente', horaInicio: { lt: ahora } }
      });

      if (solicitudesVencidas.length > 0) {
        const actualizadas = await prisma.solicitud.updateMany({
          where: { id: { in: solicitudesVencidas.map(s => s.id) } },
          data: { estado: 'Expirado' }
        });
        console.log(`[AUDITORÍA SLA] 🚨 ${actualizadas.count} solicitudes expiradas por falta de asignación.`);
      }
    } catch (error) {
      console.error('[AUDITORÍA SLA] Error ejecutando la limpieza automática:', error);
    }
  }, CINCO_MINUTOS);
};

export const detenerCronJobs = () => {
  if (robotInterval) {
    clearInterval(robotInterval);
    robotInterval = null;
    console.log('🛑 Robot de auditoría apagado correctamente.');
  }
};