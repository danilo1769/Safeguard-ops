import type { Request, Response } from 'express';
import { crearSolicitud, obtenerSolicitudesPorCliente } from '../services/solicitud.service';

export const crear = async (req: Request, res: Response): Promise<void> => {
  try {
    const solicitud = await crearSolicitud(req.body);
    res.status(201).json({ mensaje: 'Solicitud creada con éxito', solicitud });
  } catch (error: any) {
    
    console.error(`[Auditoría] Intento fallido al crear solicitud: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req: Request, res: Response): Promise<void> => {
  try {
    const clienteId = req.params.clienteId;

    if (!clienteId || typeof clienteId !== 'string') {
       res.status(400).json({ error: 'ID de cliente inválido o ausente' });
       return;
    }

    const lista = await obtenerSolicitudesPorCliente(clienteId);
    res.status(200).json(lista);
    
  } catch (error: unknown) {
    console.error(`[Auditoría] Error crítico al listar solicitudes:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};