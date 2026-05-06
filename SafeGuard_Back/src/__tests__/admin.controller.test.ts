import { describe, it, expect, vi } from 'vitest';
import { cargarPanel, asignar, descargarReporte } from '../controllers/admin.controller';
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

describe('Admin Controller - Descarga de Reportes', () => {
    it('Debe responder con status 200 y el archivo CSV si todo es correcto', async () => {
      const csvFalso = 'Col1,Col2\nDato1,Dato2';
      vi.mocked(adminService.generarReporteNominaCSV).mockResolvedValue(csvFalso);
      
      const req = {} as Request;
      const res = { 
        setHeader: vi.fn(), 
        status: vi.fn().mockReturnThis(), 
        send: vi.fn(), 
        json: vi.fn()
      } as unknown as Response;

      await descargarReporte(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('attachment; filename='));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(csvFalso);
    });

    it('Debe responder con error 404 si el servicio no encuentra turnos', async () => {
      vi.mocked(adminService.generarReporteNominaCSV).mockRejectedValue(new Error('404: No hay turnos'));
      
      const req = {} as Request;
      const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

      await descargarReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: '404: No hay turnos' });
    });
  });