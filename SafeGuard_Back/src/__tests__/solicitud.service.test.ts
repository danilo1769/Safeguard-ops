import { describe, it, expect, beforeEach } from 'vitest';
import { crearSolicitud, obtenerSolicitudesPorCliente } from '../services/solicitud.service';
import { prisma } from '../config/db'; 

describe('Solicitud Service - Reglas de Negocio', () => {
  
  beforeEach(async () => {
    await prisma.turno.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany();
  });

  it('Debe rechazar la solicitud si la fecha de inicio está en el pasado', async () => {
    const datos = { clienteId: 'C1', ubicacion: 'A', horaInicio: '2020-01-01T10:00', horaFin: '2020-01-01T18:00', latitud: 0, longitud: 0 };
    await expect(crearSolicitud(datos)).rejects.toThrow('400: La fecha de inicio no puede estar en el pasado');
  });

  it('Debe crear la solicitud con estado "Pendiente" si la fecha es válida', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'Wayne', email: 'w@test.com', passwordHash: '123', rol: 'Contratante' } });
    
    const inicio = new Date(Date.now() + 86400000).toISOString(); 
    const fin = new Date(Date.now() + 90000000).toISOString(); 

    const datos = { clienteId: cliente.id, ubicacion: 'Sede Principal', horaInicio: inicio, horaFin: fin, latitud: 6.17, longitud: -75.59 };
    const nueva = await crearSolicitud(datos);
    
    expect(nueva.estado).toBe('Pendiente');
  });

  it('Debe retornar las solicitudes filtradas por cliente', async () => {
    const cliente = await prisma.usuario.create({ data: { nombre: 'Stark', email: 's@test.com', passwordHash: '123', rol: 'Contratante' } });
    
    await prisma.solicitud.create({
      data: { clienteId: cliente.id, ubicacion: 'A', horaInicio: new Date(Date.now() + 86400000), horaFin: new Date(Date.now() + 90000000), latitud: 0, longitud: 0, estado: 'Pendiente' }
    });

    const resultados = await obtenerSolicitudesPorCliente(cliente.id);
    expect(resultados).toHaveLength(1);
  });

  it('Debe rechazar la solicitud si falta el clienteId', async () => {
    const datosMalos = { clienteId: '', ubicacion: 'A', horaInicio: '2030-01-01', horaFin: '2030-01-01', latitud: 0, longitud: 0 };
    await expect(crearSolicitud(datosMalos)).rejects.toThrow('400: Error de sesión');
  });
  
});