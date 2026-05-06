import { describe, it, expect, beforeEach } from 'vitest';
import { registrarUsuario, loginUsuario } from '../services/auth.service';
import { prisma } from '../config/db'; 

describe('Auth Service - Reglas de Negocio', () => {
  
  beforeEach(async () => {
    await prisma.turno.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.usuario.deleteMany(); 
  });

  it('Debe rechazar el registro si la contraseña tiene menos de 8 caracteres (Norma NIST)', async () => {
    const datosMalos = { nombre: 'Juan', email: 'juan@test.com', passwordHash: '123', rol: 'Vigilante' };
    
    await expect(registrarUsuario(datosMalos))
      .rejects
      .toThrow('400: La contraseña debe tener mínimo 8 caracteres');
  });

  it('Debe registrar un usuario correctamente y agregarlo a la BD', async () => {
    const datosBuenos = { nombre: 'Ana', email: 'ana@test.com', passwordHash: 'Admin1234', rol: 'Administrativo' };
    
    const usuario = await registrarUsuario(datosBuenos);
    
    expect(usuario).toHaveProperty('id');
    
    const enBD = await prisma.usuario.findUnique({ where: { email: 'ana@test.com' } });
    expect(enBD).not.toBeNull(); 
    expect(enBD?.nombre).toBe('Ana');
  });

  it('Debe rechazar el registro si el correo ya existe', async () => {
    const datos = { nombre: 'Juan', email: 'juan@test.com', passwordHash: 'Admin1234', rol: 'Vigilante' };
    await registrarUsuario(datos); 
    
    await expect(registrarUsuario(datos)) 
      .rejects
      .toThrow('400: El correo ya está registrado');
  });

  it('Debe rechazar el login si la contraseña es incorrecta', async () => {
    const datos = { nombre: 'Ana', email: 'ana@test.com', passwordHash: 'Admin1234', rol: 'Administrativo' };
    await registrarUsuario(datos);

    await expect(loginUsuario('ana@test.com', 'ClaveEquivocada'))
      .rejects
      .toThrow('401: Credenciales inválidas');
  });

  it('Debe hacer login exitosamente y retornar el token y usuario', async () => {
    const datos = { nombre: 'Pedro', email: 'pedro@test.com', passwordHash: 'Admin1234', rol: 'Contratante' };
    await registrarUsuario(datos);

    const respuesta = await loginUsuario('pedro@test.com', 'Admin1234');
    
    expect(respuesta.mensaje).toBe('Login exitoso');
    expect(respuesta).toHaveProperty('token');
    expect(respuesta.usuario.rol).toBe('Contratante');
  });

  it('Debe rechazar el login si el correo no existe', async () => {
    await expect(loginUsuario('fantasma@test.com', 'Admin1234'))
      .rejects
      .toThrow('401: Credenciales inválidas');
  });
});