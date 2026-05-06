import type { Request, Response } from 'express';
import { calcularDistanciaHaversine } from '../utils/geo';
import { prisma } from '../config/db';
import { registrarClockOut, obtenerTurnosVigilante, reportarAusencia } from '../services/turno.service';

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
    const { turnoId, latVigilante, lngVigilante } = req.body; 
    
    if (!turnoId || latVigilante === undefined || lngVigilante === undefined) {
      res.status(400).json({ error: 'Faltan datos (ID de turno o GPS) para hacer clock-out' });
      return;
    }

    const turno = await registrarClockOut(turnoId, latVigilante, lngVigilante);
    
    res.status(200).json({ 
      mensaje: `Turno finalizado. Horas trabajadas: ${turno.horasEfectivas}`, 
      turno 
    });
  } catch (error: any) {
    const status = error.message.startsWith('404') ? 404 : 403; 
    res.status(status).json({ error: error.message });
  }
};

export const misTurnos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vigilanteId } = req.params;
    
    if (!vigilanteId || typeof vigilanteId !== 'string') {
      res.status(400).json({ error: 'ID de vigilante inválido' });
      return;
    }

    const turnos = await obtenerTurnosVigilante(vigilanteId);
    res.status(200).json(turnos);
  } catch (error: unknown) {
    console.error(`[Auditoría] Error cargando turnos del vigilante:`, error);
    res.status(500).json({ error: 'Error al buscar los turnos' });
  }
};

export const reportarFalta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turnoId } = req.body;
    if (!turnoId) { res.status(400).json({ error: 'Falta ID' }); return; }
    
    const turno = await reportarAusencia(turnoId);
    res.status(200).json({ mensaje: 'Ausencia reportada con éxito. Enviaremos un reemplazo.', turno });
  } catch (error: any) {
    const status = error.message.startsWith('40') ? Number.parseInt(error.message.substring(0, 3)) : 500;
    res.status(status).json({ error: error.message });
  }
};