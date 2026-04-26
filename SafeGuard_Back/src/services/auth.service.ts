import { prisma } from '../config/db';

// Usamos un tipo genérico temporal, pero luego usaremos los de Prisma
export const registrarUsuario = async (datos: { nombre: string, email: string, passwordHash: string, rol: string }) => {
  // 1. Regla NIST
  if (datos.passwordHash.length < 8) {
    throw new Error('400: La contraseña debe tener mínimo 8 caracteres');
  }

  // 2. Buscar si existe en la BD Real
  const existe = await prisma.usuario.findUnique({
    where: { email: datos.email }
  });

  if (existe) {
    throw new Error('400: El correo ya está registrado');
  }

  // 3. Insertar en la BD Real
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      passwordHash: datos.passwordHash,
      rol: datos.rol
    }
  });

  return nuevoUsuario;
};

export const loginUsuario = async (email: string, password: string) => {
  // Buscar en la BD Real
  const usuario = await prisma.usuario.findUnique({
    where: { email: email }
  });
  
  if (!usuario) {
    throw new Error('401: Credenciales inválidas');
  }

  if (usuario.passwordHash !== password) {
    throw new Error('401: Credenciales inválidas');
  }

  return {
    mensaje: "Login exitoso",
    token: `fake-jwt-token-${usuario.id}`,
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } 
  };
};