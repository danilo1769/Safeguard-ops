import { describe, it, expect, vi } from 'vitest';
import { crear, listar } from '../controllers/solicitud.controller';
import * as solService from '../services/solicitud.service';
import type { Request, Response } from 'express';

vi.mock('../services/solicitud.service');

describe('Solicitud Controller', () => {
  it('Debe responder 201 al crear solicitud', async () => {
    vi.mocked(solService.crearSolicitud).mockResolvedValue({ id: '1', estado: 'Pendiente' } as any);
    const req = { body: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('Debe responder 400 si falta ID de cliente al listar', async () => {
    const req = { params: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await listar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Debe responder 200 y la lista de solicitudes', async () => {
    vi.mocked(solService.obtenerSolicitudesPorCliente).mockResolvedValue([]);
    const req = { params: { clienteId: 'CLI-1' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await listar(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});