import { describe, it, expect, vi } from 'vitest';
import { register } from '../controllers/auth.controller';
import * as authService from '../services/auth.service';
import type { Request, Response } from 'express';

// "Secuestramos" el servicio para que no llame a la lógica real
vi.mock('../services/auth.service');

describe('Auth Controller', () => {
  
  it('Debe retornar status 201 y un mensaje de éxito al registrar', async () => {
    // 1. Preparamos el Mock del Servicio
    vi.mocked(authService.registrarUsuario).mockResolvedValue({
      id: 'USER-123',
      createdAt: new Date(),
      nombre: 'Test',
      email: 'test@test.com',
      passwordHash: '123',
      rol: 'Vigilante'
    });

    // 2. Preparamos los Mocks de Express (req, res)
    const req = { body: { nombre: 'Test' } } as Request;
    
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res); // Permite encadenar res.status().json()
    res.json = vi.fn();

    // 3. Ejecutamos el controlador
    await register(req, res);

    // 4. Verificamos que el controlador hizo su trabajo
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Usuario creado', id: 'USER-123' });
  });

  it('Debe retornar status 400 si el servicio lanza un error', async () => {
    // Simulamos que el servicio detectó una clave corta
    vi.mocked(authService.registrarUsuario).mockRejectedValue(new Error('400: Error de validación'));

    const req = { body: {} } as Request;
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: '400: Error de validación' });
  });
});
