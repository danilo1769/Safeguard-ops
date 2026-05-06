import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { iniciarCronJobs, detenerCronJobs } from '../jobs/cron.job'; // <-- Importamos detener
import { prisma } from '../config/db';

vi.mock('../config/db', () => ({
  prisma: {
    solicitud: { findMany: vi.fn(), updateMany: vi.fn() }
  }
}));

describe('Auditoría Nativa (CRON Job)', () => {
  beforeEach(() => {
    vi.useFakeTimers(); 
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {}); // Para el warning del Singleton
  });

  afterEach(() => {
    detenerCronJobs(); 
    
    vi.clearAllMocks(); 
    vi.clearAllTimers();
    vi.useRealTimers(); 
  });

  it('Debe actualizar solicitudes vencidas cuando pasan 5 minutos', async () => {
    vi.mocked(prisma.solicitud.findMany).mockResolvedValue([{ id: 'SOL-VENCIDA' } as any]);
    vi.mocked(prisma.solicitud.updateMany).mockResolvedValue({ count: 1 });

    iniciarCronJobs();

    await vi.advanceTimersByTimeAsync((5 * 60 * 1000) + 1000);

    expect(prisma.solicitud.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.solicitud.updateMany).toHaveBeenCalled();
  });

  it('No debe hacer update si no hay solicitudes vencidas', async () => {
    vi.mocked(prisma.solicitud.findMany).mockResolvedValue([]);

    iniciarCronJobs();

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

    expect(prisma.solicitud.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.solicitud.updateMany).not.toHaveBeenCalled();
  });

  it('Debe evitar que se inicien múltiples robots (Singleton)', () => {
    iniciarCronJobs();
    iniciarCronJobs();
    iniciarCronJobs();

    expect(console.warn).toHaveBeenCalledWith('⚠️ Intento de iniciar múltiples robots bloqueado.');
  });

  it('Debe atrapar errores si la base de datos se cae durante el cron', async () => {
    vi.mocked(prisma.solicitud.findMany).mockRejectedValue(new Error('Caída DB'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    iniciarCronJobs();
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    
    expect(consoleSpy).toHaveBeenCalledWith('[AUDITORÍA SLA] Error ejecutando la limpieza automática:', expect.any(Error));
  });
  
});