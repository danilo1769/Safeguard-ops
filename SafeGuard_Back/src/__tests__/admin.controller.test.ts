import { describe, it, expect, vi } from 'vitest';
import { cargarPanel, asignar } from '../controllers/admin.controller';
import * as adminService from '../services/admin.service';
import type { Request, Response } from 'express';

vi.mock('../services/admin.service');

describe('Admin Controller', () => {

  it('Debe responder con status 200 y los datos del panel', async () => {
    vi.mocked(adminService.obtenerDatosPanelAdmin).mockResolvedValue({ solicitudesPendientes: [], vigilantes: [] });
    
    const req = {} as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await cargarPanel(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ solicitudesPendientes: [], vigilantes: [] });
  });

  it('Debe responder con status 400 si faltan datos al asignar', async () => {
    const req = { body: { solicitudId: 'SOL-1' } } as Request; // Falta vigilanteId
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await asignar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos para la asignación' });
  });

  it('Debe retornar error 500 si cargarPanel falla estrepitosamente', async () => {
    vi.mocked(adminService.obtenerDatosPanelAdmin).mockRejectedValue(new Error('Fallo de Base de Datos'));
    const req = {} as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await cargarPanel(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error cargando datos del administrador' });
  });

  it('Debe retornar error 404 si falla la asignación por no encontrar el dato', async () => {
    vi.mocked(adminService.asignarVigilante).mockRejectedValue(new Error('404: Solicitud no encontrada'));
    const req = { body: { solicitudId: 'A', vigilanteId: 'B' } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await asignar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
  });

});