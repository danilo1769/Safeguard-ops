import type { Request, Response } from 'express';
import { obtenerDatosPanelAdmin, asignarVigilante, generarReporteNominaCSV } from '../services/admin.service';

export const cargarPanel = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos = await obtenerDatosPanelAdmin();
    res.status(200).json(datos);
  } catch (error) {
    console.error(`[Auditoría] Error crítico al controlar admin:`, error);
    res.status(500).json({ error: 'Error cargando datos del administrador' });
  }
};

export const asignar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { solicitudId, vigilanteId } = req.body;
    
    if (!solicitudId || !vigilanteId) {
      res.status(400).json({ error: 'Faltan datos para la asignación' });
      return;
    }

    const turno = await asignarVigilante(solicitudId, vigilanteId);
    res.status(201).json({ mensaje: 'Vigilante asignado correctamente', turno });
  } catch (error: any) {
    console.error(`[Auditoría Asignación]: ${error.message}`);
    const status = error.message.startsWith('404') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const descargarReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const csvData = await generarReporteNominaCSV();

    // PRO-CODE: Le decimos al navegador que esto no es JSON, es un archivo descargable
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Nomina_SafeGuard.csv"');
    
    res.status(200).send(csvData); // Enviamos el texto puro
  } catch (error: any) {
    const status = error.message.startsWith('404') ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};