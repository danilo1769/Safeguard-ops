import { prisma } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const registrarUsuario = async (datos: { nombre: string, email: string, passwordHash: string, rol: string }) => {
  if (datos.passwordHash.length < 8) {
    throw new Error('400: La contraseña debe tener mínimo 8 caracteres');
  }

  const existe = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (existe) throw new Error('400: El correo ya está registrado');

  const saltRounds = 10;
  const claveEncriptada = await bcrypt.hash(datos.passwordHash, saltRounds);

  const nuevoUsuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      passwordHash: claveEncriptada, 
      rol: datos.rol
    }
  });

  return nuevoUsuario;
};

export const loginUsuario = async (email: string, password: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { email: email } });
  if (!usuario) throw new Error('401: Credenciales inválidas');

  const esValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!esValida) throw new Error('401: Credenciales inválidas');

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol }, 
    JWT_SECRET, 
    { expiresIn: '8h' } 
  );

  return {
    mensaje: "Login exitoso",
    token: token,
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
  };
};