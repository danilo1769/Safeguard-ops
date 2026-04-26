import type { Request, Response } from 'express';
import { calcularDistanciaHaversine } from '../utils/geo';
import { prisma } from '../config/db';
import { registrarClockOut } from '../services/turno.service';

export const clockIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turnoId, latVigilante, lngVigilante } = req.body;

    const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
    if (!turno) throw new Error("404: Turno no encontrado");

    const distancia = calcularDistanciaHaversine(
      latVigilante, lngVigilante, 
      turno.latitudPuesto, turno.longitudPuesto
    );

    if (distancia > 100) {
      throw new Error(`403: Ubicación fuera de rango. Estás a ${Math.round(distancia)} metros del puesto.`);
    }

    // Actualizamos el estado en la base de datos
    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: 'En turno' }
    });

    res.status(200).json({ 
      mensaje: "Clock-in exitoso. Turno iniciado.", 
      distancia: Math.round(distancia) 
    });

  } catch (error: any) {
    const status = error.message.startsWith('404') ? 404 : 403;
    res.status(status).json({ error: error.message });
  }
};

export const clockOut = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraemos el GPS que ahora manda el Frontend
    const { turnoId, latVigilante, lngVigilante } = req.body; 
    
    if (!turnoId || latVigilante === undefined || lngVigilante === undefined) {
      res.status(400).json({ error: 'Faltan datos (ID de turno o GPS) para hacer clock-out' });
      return;
    }

    // Le pasamos los 3 argumentos al servicio
    const turno = await registrarClockOut(turnoId, latVigilante, lngVigilante);
    
    res.status(200).json({ 
      mensaje: `Turno finalizado. Horas trabajadas: ${turno.horasEfectivas}`, 
      turno 
    });
  } catch (error: any) {
    const status = error.message.startsWith('404') ? 404 : 403; // 403 por si es fraude de GPS
    res.status(status).json({ error: error.message });
  }
};