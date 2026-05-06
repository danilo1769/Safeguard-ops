import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { registrarClockOut, obtenerTurnosVigilante } from '../services/turno.service';
import { prisma } from '../config/db';

describe('Turno Service - Antifraude y Clock-out', () => {
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

  it('Debe retornar los turnos de un vigilante', async () => {
    const vig = await prisma.usuario.create({ data: { nombre: 'V', email: 'v@v.com', passwordHash: '1', rol: 'Vigilante' } });
    const cli = await prisma.usuario.create({ data: { nombre: 'C', email: 'c@c.com', passwordHash: '1', rol: 'Contratante' } });
    const sol = await prisma.solicitud.create({ data: { clienteId: cli.id, ubicacion: 'A', latitud: 0, longitud: 0, horaInicio: new Date(), horaFin: new Date() }});
    
    await prisma.turno.create({ data: { vigilanteId: vig.id, solicitudId: sol.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: new Date(), horaFinEstimada: new Date() } });

    const turnos = await obtenerTurnosVigilante(vig.id);
    expect(turnos).toHaveLength(1);
  });

  it('Debe rechazar Clock-out si el turno no existe', async () => {
    await expect(registrarClockOut('TURNO-FALSO', 0, 0)).rejects.toThrow('404: Turno no encontrado');
  });

  it('Debe rechazar Clock-out si el turno no está en estado "En turno"', async () => {
    const vig = await prisma.usuario.create({ data: { nombre: 'V2', email: 'v2@v.com', passwordHash: '1', rol: 'Vigilante' } });
    const cli = await prisma.usuario.create({ data: { nombre: 'C2', email: 'c2@c.com', passwordHash: '1', rol: 'Contratante' } });
    const sol = await prisma.solicitud.create({ data: { clienteId: cli.id, ubicacion: 'B', latitud: 0, longitud: 0, horaInicio: new Date(), horaFin: new Date() }});
    
    const turno = await prisma.turno.create({ data: { vigilanteId: vig.id, solicitudId: sol.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: new Date(), horaFinEstimada: new Date(), estado: 'Pendiente' } });

    await expect(registrarClockOut(turno.id, 0, 0)).rejects.toThrow('400: No puedes finalizar un turno que no ha iniciado');
  });

  it('Debe rechazar Clock-out si intenta irse antes de la hora acordada', async () => {
    const vig = await prisma.usuario.create({ data: { nombre: 'V3', email: 'v3@v.com', passwordHash: '1', rol: 'Vigilante' } });
    const cli = await prisma.usuario.create({ data: { nombre: 'C3', email: 'c3@c.com', passwordHash: '1', rol: 'Contratante' } });
    
    const horaApertura = new Date('2030-01-01T08:00:00Z');
    const horaCierre = new Date('2030-01-01T18:00:00Z'); 

    const sol = await prisma.solicitud.create({ data: { clienteId: cli.id, ubicacion: 'C', latitud: 0, longitud: 0, horaInicio: horaApertura, horaFin: horaCierre }});
    const turno = await prisma.turno.create({ data: { vigilanteId: vig.id, solicitudId: sol.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: horaApertura, horaFinEstimada: horaCierre, estado: 'En turno' } });

    vi.setSystemTime(new Date('2030-01-01T14:00:00Z'));

    await expect(registrarClockOut(turno.id, 0, 0)).rejects.toThrow('403: No puedes abandonar tu puesto. Tu turno aún no ha terminado.');
  });

  it('Debe rechazar Clock-out si la distancia GPS es mayor a 100m (Fraude)', async () => {
    const vig = await prisma.usuario.create({ data: { nombre: 'V4', email: 'v4@v.com', passwordHash: '1', rol: 'Vigilante' } });
    const cli = await prisma.usuario.create({ data: { nombre: 'C4', email: 'c4@c.com', passwordHash: '1', rol: 'Contratante' } });
    
    const horaApertura = new Date('2030-01-01T08:00:00Z');
    const sol = await prisma.solicitud.create({ data: { clienteId: cli.id, ubicacion: 'D', latitud: 6.17, longitud: -75.59, horaInicio: horaApertura, horaFin: horaApertura }});
    
    const turno = await prisma.turno.create({ data: { vigilanteId: vig.id, solicitudId: sol.id, latitudPuesto: 6.17, longitudPuesto: -75.59, horaInicio: horaApertura, horaFinEstimada: horaApertura, estado: 'En turno' } });

    vi.setSystemTime(horaApertura);

    await expect(registrarClockOut(turno.id, 10.01, -75.01)).rejects.toThrow(/403: Fraude detectado./);
  });

  it('Debe registrar Clock-out exitosamente y calcular horas', async () => {
    const vig = await prisma.usuario.create({ data: { nombre: 'V5', email: 'v5@v.com', passwordHash: '1', rol: 'Vigilante' } });
    const cli = await prisma.usuario.create({ data: { nombre: 'C5', email: 'c5@c.com', passwordHash: '1', rol: 'Contratante' } });
    
    const horaApertura = new Date('2030-01-01T08:00:00Z');
    const horaCierre = new Date('2030-01-01T16:00:00Z');

    const sol = await prisma.solicitud.create({ data: { clienteId: cli.id, ubicacion: 'E', latitud: 0, longitud: 0, horaInicio: horaApertura, horaFin: horaCierre }});
    const turno = await prisma.turno.create({ data: { vigilanteId: vig.id, solicitudId: sol.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: horaApertura, horaFinEstimada: horaCierre, estado: 'En turno' } });

    vi.setSystemTime(new Date('2030-01-01T16:00:00Z'));

    const turnoFinalizado = await registrarClockOut(turno.id, 0, 0);

    expect(turnoFinalizado.estado).toBe('Completado');
    expect(turnoFinalizado.horasEfectivas).toBe(8); 
  });
});