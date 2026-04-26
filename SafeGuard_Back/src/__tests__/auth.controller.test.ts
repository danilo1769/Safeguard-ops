import { describe, it, expect, vi } from 'vitest';
import { login, register } from '../controllers/auth.controller';
import * as authService from '../services/auth.service';
import type { Request, Response } from 'express';

vi.mock('../services/auth.service');

describe('Auth Controller', () => {

  // --- TESTS DE LOGIN ---
  it('Debe responder con status 200 y el token si el login es correcto', async () => {
    vi.mocked(authService.loginUsuario).mockResolvedValue({ mensaje: "Login exitoso", token: "jwt", usuario: { nombre: "Juan", rol: "Vigilante" } });
    
    const req = { body: { email: 'a@a.com', password: '123' } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Debe responder con status 401 si falla el login', async () => {
    vi.mocked(authService.loginUsuario).mockRejectedValue(new Error('401: Credenciales inválidas'));
    const req = { body: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // --- TESTS DE REGISTRO (¡Estas eran las líneas faltantes!) ---
  it('Debe responder con status 201 si el registro es correcto', async () => {
    vi.mocked(authService.registrarUsuario).mockResolvedValue({ id: 'U1', nombre: 'Ana', email: 'a@a.com', passwordHash: '123', rol: 'Vigilante', createdAt: new Date() });
    
    const req = { body: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('Debe responder con status 400 si el registro falla (Ej. Clave corta)', async () => {
    vi.mocked(authService.registrarUsuario).mockRejectedValue(new Error('400: La contraseña debe tener mínimo 8 caracteres'));
    
    const req = { body: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});