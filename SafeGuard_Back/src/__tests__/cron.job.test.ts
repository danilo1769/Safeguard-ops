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
    // AHORA SÍ: Apagamos el robot de verdad antes de la siguiente prueba
    detenerCronJobs(); 
    
    vi.clearAllMocks(); // Esto sí lo dejamos por limpieza de pruebas unitarias
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

    // Como apagamos el robot en el afterEach, aquí SABEMOS que solo se llamó 1 vez legítimamente
    expect(prisma.solicitud.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.solicitud.updateMany).not.toHaveBeenCalled();
  });

  it('Debe evitar que se inicien múltiples robots (Singleton)', () => {
    // Intentamos iniciar 3 veces
    iniciarCronJobs();
    iniciarCronJobs();
    iniciarCronJobs();

    // Verificamos que el sistema detectó y advirtió sobre la anomalía
    expect(console.warn).toHaveBeenCalledWith('⚠️ Intento de iniciar múltiples robots bloqueado.');
  });
});