import { describe, it, expect, beforeEach } from 'vitest';
import { crearSolicitud } from '../services/solicitud.service';
import { solicitudesDB } from '../config/db';

describe('Solicitud Service - Reglas de Negocio', () => {
  beforeEach(() => { solicitudesDB.length = 0; });

  it('Debe rechazar la solicitud si la fecha de inicio está en el pasado', async () => {
    const datos = { clienteId: 'CLI-1', ubicacion: 'Sede Principal', horaInicio: '2020-01-01T10:00' };
    
    await expect(crearSolicitud(datos))
      .rejects
      .toThrow('400: La fecha de inicio no puede estar en el pasado');
  });

  it('Debe crear la solicitud con estado "Pendiente" si la fecha es válida', async () => {
    // Usamos una fecha del futuro asegurada
    const fechaFutura = new Date(Date.now() + 86400000).toISOString(); // Mañana
    const datos = { clienteId: 'CLI-1', ubicacion: 'Sede Principal', horaInicio: fechaFutura };
    
    const nuevaSolicitud = await crearSolicitud(datos);
    
    expect(nuevaSolicitud.estado).toBe('Pendiente');
    expect(solicitudesDB).toHaveLength(1);
  });
});