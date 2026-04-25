import type { Request, Response } from 'express';
import { calcularDistanciaHaversine } from '../utils/geo';
import { turnosDB } from '../config/db';

export const clockIn = async (req: Request, res: Response) => {
  try {
    const { turnoId, latVigilante, lngVigilante } = req.body;

    const turno = turnosDB.find(t => t.id === turnoId);
    if (!turno) {
      throw new Error("404: Turno no encontrado");
    }

    // Usamos nuestra fórmula Pro-Code
    const distancia = calcularDistanciaHaversine(
      latVigilante, lngVigilante, 
      turno.latitudPuesto, turno.longitudPuesto
    );

    // REGLA DE NEGOCIO (PDF Pág 5): Distancia > 100m se rechaza
    if (distancia > 100) {
      throw new Error(`403: Ubicación fuera de rango. Estás a ${Math.round(distancia)} metros del puesto.`);
    }

    // Si pasa la validación, actualizamos el estado
    turno.estado = "En turno";

    res.status(200).json({ 
      mensaje: "Clock-in exitoso. Turno iniciado.", 
      distancia: Math.round(distancia) 
    });

  } catch (error: any) {
    const status = error.message.startsWith('404') ? 404 : 403;
    res.status(status).json({ error: error.message });
  }
};