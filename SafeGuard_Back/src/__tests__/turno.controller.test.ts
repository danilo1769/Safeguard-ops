import { describe, it, expect, vi } from 'vitest';
import { clockOut, misTurnos, reportarFalta } from '../controllers/turno.controller';
import * as turnoService from '../services/turno.service';
import type { Request, Response } from 'express';

vi.mock('../services/turno.service');

describe('Turno Controller', () => {
  it('Debe responder 400 si faltan datos en clock-out', async () => {
    const req = { body: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    await clockOut(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Debe responder 200 al hacer clock-out correcto', async () => {
    vi.mocked(turnoService.registrarClockOut).mockResolvedValue({ horasEfectivas: 8 } as any);
    const req = { body: { turnoId: 'T1', latVigilante: 0, lngVigilante: 0 } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await clockOut(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Debe responder 200 al pedir mis turnos', async () => {
    vi.mocked(turnoService.obtenerTurnosVigilante).mockResolvedValue([]);
    const req = { params: { vigilanteId: 'V1' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await misTurnos(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Debe responder 200 al reportar falta', async () => {
    vi.mocked(turnoService.reportarAusencia).mockResolvedValue({} as any);
    const req = { body: { turnoId: 'T1' } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    
    await reportarFalta(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});