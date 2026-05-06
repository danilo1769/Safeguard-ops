import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportarAusencia } from '../services/turno.service';
import { prisma } from '../config/db';

describe('SLA Service - Reporte de Ausencias', () => {
  beforeEach(async () => {
    await prisma.turno.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany();
    vi.useFakeTimers(); 
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('Debe rechazar el reporte si NO han pasado 15 minutos', async () => {
    const admin = await prisma.usuario.create({ data: { nombre: 'A', email: 'a@a.com', passwordHash: '1', rol: 'Vigilante' } });
    
    const fechaHace10Mins = new Date(Date.now() - (10 * 60 * 1000));
    
    const turno = await prisma.turno.create({
      data: { vigilanteId: admin.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: fechaHace10Mins, horaFinEstimada: new Date(), estado: 'Pendiente' }
    });

    await expect(reportarAusencia(turno.id))
      .rejects.toThrow('403: Aún no han pasado 15 minutos de gracia.');
  });

  it('Debe permitir el reporte si YA pasaron 15 minutos y el guardia no llegó', async () => {
    const admin = await prisma.usuario.create({ data: { nombre: 'A', email: 'b@b.com', passwordHash: '1', rol: 'Vigilante' } });
    
    const fechaHace20Mins = new Date(Date.now() - (20 * 60 * 1000));
    
    const turno = await prisma.turno.create({
      data: { vigilanteId: admin.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: fechaHace20Mins, horaFinEstimada: new Date(), estado: 'Pendiente' }
    });

    const actualizado = await reportarAusencia(turno.id);
    expect(actualizado.estado).toBe('Ausencia Reportada');
  });

  it('Debe rechazar el reporte si el vigilante ya hizo Clock-in (En turno)', async () => {
    const admin = await prisma.usuario.create({ data: { nombre: 'A', email: 'c@c.com', passwordHash: '1', rol: 'Vigilante' } });
    
    const fechaHace20Mins = new Date(Date.now() - (20 * 60 * 1000));
    
    const turno = await prisma.turno.create({
      data: { 
        vigilanteId: admin.id, latitudPuesto: 0, longitudPuesto: 0, 
        horaInicio: fechaHace20Mins, horaFinEstimada: new Date(), 
        estado: 'En turno' 
      }
    });

    await expect(reportarAusencia(turno.id))
      .rejects.toThrow('400: El turno ya fue atendido o completado.');
  });
  
});