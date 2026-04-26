import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportarAusencia } from '../services/turno.service';
import { prisma } from '../config/db';

describe('SLA Service - Reporte de Ausencias', () => {
  beforeEach(async () => {
    await prisma.turno.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany();
    vi.useFakeTimers(); // Viaje en el tiempo
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('Debe rechazar el reporte si NO han pasado 15 minutos', async () => {
    const admin = await prisma.usuario.create({ data: { nombre: 'A', email: 'a@a.com', passwordHash: '1', rol: 'Vigilante' } });
    
    // El turno debía empezar hace 10 minutos
    const fechaHace10Mins = new Date(Date.now() - (10 * 60 * 1000));
    
    const turno = await prisma.turno.create({
      data: { vigilanteId: admin.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: fechaHace10Mins, horaFinEstimada: new Date(), estado: 'Pendiente' }
    });

    await expect(reportarAusencia(turno.id))
      .rejects.toThrow('403: Aún no han pasado 15 minutos de gracia.');
  });

  it('Debe permitir el reporte si YA pasaron 15 minutos y el guardia no llegó', async () => {
    const admin = await prisma.usuario.create({ data: { nombre: 'A', email: 'b@b.com', passwordHash: '1', rol: 'Vigilante' } });
    
    // El turno debía empezar hace 20 minutos
    const fechaHace20Mins = new Date(Date.now() - (20 * 60 * 1000));
    
    const turno = await prisma.turno.create({
      data: { vigilanteId: admin.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: fechaHace20Mins, horaFinEstimada: new Date(), estado: 'Pendiente' }
    });

    const actualizado = await reportarAusencia(turno.id);
    expect(actualizado.estado).toBe('Ausencia Reportada');
  });
});