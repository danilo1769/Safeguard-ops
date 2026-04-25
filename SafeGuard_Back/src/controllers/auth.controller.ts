import type { Request, Response } from 'express';
import { registrarUsuario, loginUsuario } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const nuevoUsuario = await registrarUsuario(req.body);
    res.status(201).json({ mensaje: 'Usuario creado', id: nuevoUsuario.id });
  } catch (error: any) {
    // Extraemos el código HTTP del error que lanzamos en el servicio
    const status = error.message.startsWith('401') ? 401 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const authData = await loginUsuario(email, password);
    res.status(200).json(authData);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};