import { describe, it, expect, beforeEach } from 'vitest';
import { crearSolicitud, obtenerSolicitudesPorCliente } from '../services/solicitud.service';
import { prisma } from '../config/db'; 

describe('Solicitud Service - Reglas de Negocio', () => {
  
  // Limpiamos las tablas antes de cada prueba (El orden importa por las llaves foráneas)
  beforeEach(async () => {
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany();
  });

  it('Debe rechazar la solicitud si la fecha de inicio está en el pasado', async () => {
    const datos = { clienteId: 'CLI-FALSO', ubicacion: 'Sede Principal', horaInicio: '2020-01-01T10:00' };
    
    await expect(crearSolicitud(datos))
      .rejects
      .toThrow('400: La fecha de inicio no puede estar en el pasado');
  });

  it('Debe crear la solicitud con estado "Pendiente" si la fecha es válida', async () => {
    // 1. Para probar, primero debemos crear un Cliente real en SQLite
    const cliente = await prisma.usuario.create({
      data: { nombre: 'Wayne Corp', email: 'w@test.com', passwordHash: '123', rol: 'Contratante' }
    });

    // 2. Usamos una fecha del futuro
    const fechaFutura = new Date(Date.now() + 86400000).toISOString(); 
    const datos = { clienteId: cliente.id, ubicacion: 'Sede Principal', horaInicio: fechaFutura };
    
    // 3. Ejecutamos la función
    const nuevaSolicitud = await crearSolicitud(datos);
    
    expect(nuevaSolicitud.estado).toBe('Pendiente');
    
    // Verificamos directo en la BD
    const enBD = await prisma.solicitud.findUnique({ where: { id: nuevaSolicitud.id } });
    expect(enBD).not.toBeNull();
  });

  it('Debe retornar las solicitudes filtradas por cliente', async () => {
    // Creamos Cliente
    const cliente = await prisma.usuario.create({
      data: { nombre: 'Stark Ind', email: 's@test.com', passwordHash: '123', rol: 'Contratante' }
    });
    
    // Creamos Solicitud directo en la BD
    await prisma.solicitud.create({
      data: { clienteId: cliente.id, ubicacion: 'A', horaInicio: new Date(Date.now() + 86400000), estado: 'Pendiente' }
    });

    const resultados = await obtenerSolicitudesPorCliente(cliente.id);
    expect(resultados).toHaveLength(1);
    expect(resultados[0]?.clienteId).toBe(cliente.id);
  });
});