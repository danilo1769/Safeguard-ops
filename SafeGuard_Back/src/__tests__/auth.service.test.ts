import { describe, it, expect, beforeEach } from 'vitest';
import { registrarUsuario, loginUsuario } from '../services/auth.service';
import { usuariosDB } from '../config/db';

describe('Auth Service - Reglas de Negocio', () => {
  
  // 'beforeEach' limpia la base de datos simulada antes de cada prueba
  // Esto garantiza el principio de "Aislamiento" de las pruebas.
  beforeEach(() => {
    usuariosDB.length = 0; 
  });

  it('Debe rechazar el registro si la contraseña tiene menos de 8 caracteres (Norma NIST)', async () => {
    const datosMalos = { nombre: 'Juan', email: 'juan@test.com', passwordHash: '123', rol: 'Vigilante' as const };
    
    await expect(registrarUsuario(datosMalos))
      .rejects
      .toThrow('400: La contraseña debe tener mínimo 8 caracteres');
  });

  it('Debe registrar un usuario correctamente y agregarlo a la BD', async () => {
    const datosBuenos = { nombre: 'Ana', email: 'ana@test.com', passwordHash: 'Admin1234', rol: 'Administrativo' as const };
    
    const usuario = await registrarUsuario(datosBuenos);
    
    expect(usuario).toHaveProperty('id');
    expect(usuariosDB).toHaveLength(1); // Verificamos que se guardó
  });

  it('Debe rechazar el login si el correo no existe', async () => {
    await expect(loginUsuario('fantasma@test.com', 'Admin1234'))
      .rejects
      .toThrow('401: Credenciales inválidas');
  });
  
  it('Debe rechazar el registro si el correo ya existe', async () => {
    const datos = { nombre: 'Juan', email: 'juan@test.com', passwordHash: 'Admin1234', rol: 'Vigilante' as const };
    await registrarUsuario(datos); // Lo registramos una vez (Exitoso)
    
    // Intentamos registrarlo de nuevo con el mismo correo
    await expect(registrarUsuario(datos))
      .rejects
      .toThrow('400: El correo ya está registrado');
  });

  it('Debe rechazar el login si la contraseña es incorrecta', async () => {
    // Primero registramos a alguien
    const datos = { nombre: 'Ana', email: 'ana@test.com', passwordHash: 'Admin1234', rol: 'Administrativo' as const };
    await registrarUsuario(datos);

    // Intentamos loguearnos con otra clave
    await expect(loginUsuario('ana@test.com', 'ClaveEquivocada'))
      .rejects
      .toThrow('401: Credenciales inválidas');
  });

  it('Debe hacer login exitosamente y retornar el token y usuario', async () => {
    // Registramos a alguien
    const datos = { nombre: 'Pedro', email: 'pedro@test.com', passwordHash: 'Admin1234', rol: 'Contratante' as const };
    await registrarUsuario(datos);

    // Hacemos el login correcto
    const respuesta = await loginUsuario('pedro@test.com', 'Admin1234');
    
    expect(respuesta.mensaje).toBe('Login exitoso');
    expect(respuesta).toHaveProperty('token');
    expect(respuesta.usuario.rol).toBe('Contratante');
  });
});