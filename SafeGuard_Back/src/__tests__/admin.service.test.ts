import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerDatosPanelAdmin, asignarVigilante } from '../services/admin.service';
import { prisma } from '../config/db';

describe('Admin Service - Reglas de Asignación (Base de Datos Real)', () => {
  
  beforeEach(async () => {
    // Limpiamos la base de datos en el orden correcto
    await prisma.turno.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany();
  });

  it('Debe retornar las solicitudes pendientes y los vigilantes', async () => {
    // 1. Preparamos los datos
    const cliente = await prisma.usuario.create({ data: { nombre: 'C1', email: 'c1@test.com', passwordHash: '123', rol: 'Contratante' } });
    await prisma.usuario.create({ data: { nombre: 'V1', email: 'v1@test.com', passwordHash: '123', rol: 'Vigilante' } });
    await prisma.solicitud.create({ data: { clienteId: cliente.id, ubicacion: 'Sede A', horaInicio: new Date(), estado: 'Pendiente' } });

    // 2. Ejecutamos
    const datos = await obtenerDatosPanelAdmin();
    
    // 3. Validamos
    expect(datos.solicitudesPendientes).toHaveLength(1);
    expect(datos.vigilantes).toHaveLength(1);
  });

  it('Debe lanzar error 404 si la solicitud o el vigilante no existen', async () => {
    await expect(asignarVigilante('ID-FALSO', 'VIG-FALSO'))
      .rejects.toThrow('404: Solicitud no encontrada');
  });

  it('Debe rechazar la asignación si el vigilante ya tiene un turno a esa misma hora', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'C1', email: 'c1@test.com', passwordHash: '123', rol: 'Contratante' } });
    const vigilante = await prisma.usuario.create({ data: { nombre: 'Batman', email: 'b@b.com', passwordHash: '123', rol: 'Vigilante' } });
    
    const fechaHora = new Date('2026-10-10T08:00:00Z');

    const solicitud = await prisma.solicitud.create({ 
      data: { clienteId: cliente.id, ubicacion: 'Sede A', horaInicio: fechaHora, estado: 'Pendiente' } 
    });

    // Le creamos un turno previo EXACTAMENTE a esa hora
    await prisma.turno.create({
      data: { vigilanteId: vigilante.id, latitudPuesto: 0, longitudPuesto: 0, horaInicio: fechaHora, estado: 'Pendiente' }
    });

    // Intentamos asignar la nueva solicitud
    await expect(asignarVigilante(solicitud.id, vigilante.id))
      .rejects.toThrow('400: Vigilante Ocupado. Ya tiene un turno asignado en esa fecha y hora.');
  });

  it('Debe asignar el turno correctamente usando una Transacción', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'C1', email: 'c1@test.com', passwordHash: '123', rol: 'Contratante' } });
    const vigilante = await prisma.usuario.create({ data: { nombre: 'Robin', email: 'r@r.com', passwordHash: '123', rol: 'Vigilante' } });
    
    const solicitud = await prisma.solicitud.create({ 
      data: { clienteId: cliente.id, ubicacion: 'Sede B', horaInicio: new Date(), estado: 'Pendiente' } 
    });

    // Ejecutamos la asignación (La transacción)
    const nuevoTurno = await asignarVigilante(solicitud.id, vigilante.id);
    
    expect(nuevoTurno.vigilanteId).toBe(vigilante.id);
    
    // Verificamos que la solicitud cambió a 'Asignado' en la base de datos
    const solicitudActualizada = await prisma.solicitud.findUnique({ where: { id: solicitud.id } });
    expect(solicitudActualizada?.estado).toBe('Asignado');
  });
});