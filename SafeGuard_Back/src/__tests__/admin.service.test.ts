import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerDatosPanelAdmin, asignarVigilante } from '../services/admin.service';
import { prisma } from '../config/db';

describe('Admin Service - Reglas de Asignación', () => {
  
  beforeEach(async () => {
    await prisma.turno.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany();
  });

  it('Debe retornar las solicitudes pendientes y los vigilantes', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'C1', email: 'c1@test.com', passwordHash: '123', rol: 'Contratante' } });
    await prisma.usuario.create({ data: { nombre: 'V1', email: 'v1@test.com', passwordHash: '123', rol: 'Vigilante' } });
    
    await prisma.solicitud.create({ data: { clienteId: cliente.id, ubicacion: 'A', horaInicio: new Date(), horaFin: new Date(), latitud: 0, longitud: 0, estado: 'Pendiente' } });

    const datos = await obtenerDatosPanelAdmin();
    expect(datos.solicitudesPendientes).toHaveLength(1);
  });

  it('Debe lanzar error 404 si la solicitud no existe', async () => {
    await expect(asignarVigilante('ID-FALSO', 'VIG-FALSO')).rejects.toThrow('404: Solicitud no encontrada');
  });

  it('Debe rechazar la asignación si el vigilante ya tiene un turno a esa misma hora', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'C1', email: 'c1@test.com', passwordHash: '123', rol: 'Contratante' } });
    const vigilante = await prisma.usuario.create({ data: { nombre: 'Batman', email: 'b@b.com', passwordHash: '123', rol: 'Vigilante' } });
    
    const fechaHora = new Date('2030-10-10T08:00:00Z');

    // Esta es la solicitud nueva que intentaremos asignarle
    const solicitud = await prisma.solicitud.create({ 
      data: { clienteId: cliente.id, ubicacion: 'A', horaInicio: fechaHora, horaFin: fechaHora, latitud: 0, longitud: 0, estado: 'Pendiente' } 
    });

    // FIX: Creamos una solicitud REAL previa para que el turno previo tenga donde anclarse
    const solicitudPrevia = await prisma.solicitud.create({ 
      data: { clienteId: cliente.id, ubicacion: 'B', horaInicio: fechaHora, horaFin: fechaHora, latitud: 0, longitud: 0, estado: 'Asignado' } 
    });

    // Le creamos el turno ocupado asociado a la solicitud real
    await prisma.turno.create({
      data: { 
        vigilanteId: vigilante.id, 
        solicitudId: solicitudPrevia.id, // <-- AQUÍ USAMOS EL ID REAL
        latitudPuesto: 0, 
        longitudPuesto: 0, 
        horaInicio: fechaHora, 
        horaFinEstimada: fechaHora, 
        estado: 'Pendiente' 
      }
    });

    // Intentamos asignarle la nueva, ¡debe explotar!
    await expect(asignarVigilante(solicitud.id, vigilante.id)).rejects.toThrow('400: Vigilante Ocupado.');
  });

  it('Debe asignar el turno usando una Transacción', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'C1', email: 'c1@test.com', passwordHash: '123', rol: 'Contratante' } });
    const vigilante = await prisma.usuario.create({ data: { nombre: 'Robin', email: 'r@r.com', passwordHash: '123', rol: 'Vigilante' } });
    
    const solicitud = await prisma.solicitud.create({ 
      data: { clienteId: cliente.id, ubicacion: 'Sede B', horaInicio: new Date(), horaFin: new Date(), latitud: 0, longitud: 0, estado: 'Pendiente' } 
    });

    const nuevoTurno = await asignarVigilante(solicitud.id, vigilante.id);
    expect(nuevoTurno.vigilanteId).toBe(vigilante.id);
  });
});