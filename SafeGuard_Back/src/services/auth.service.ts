import { usuariosDB, type Usuario } from '../config/db';

export const registrarUsuario = async (datos: Omit<Usuario, 'id'>) => {
  // Regla: Contraseña segura (NIST SP 800-63B)
  if (datos.passwordHash.length < 8) {
    throw new Error('400: La contraseña debe tener mínimo 8 caracteres');
  }

  // Regla: No duplicados
  const existe = usuariosDB.find(u => u.email === datos.email);
  if (existe) {
    throw new Error('400: El correo ya está registrado');
  }

  // En un entorno real, aquí usaríamos bcrypt para encriptar la contraseña.
  const nuevoUsuario: Usuario = {
    id: `USER-${Date.now()}`,
    ...datos
  };

  usuariosDB.push(nuevoUsuario);
  return nuevoUsuario;
};

export const loginUsuario = async (email: string, password: string) => {
  const usuario = usuariosDB.find(u => u.email === email);
  
  if (!usuario) {
    throw new Error('401: Credenciales inválidas'); // Regla del PDF
  }

  // En Pro-Code compararíamos hashes. Aquí simulamos la comparación directa.
  if (usuario.passwordHash !== password) {
    throw new Error('401: Credenciales inválidas');
  }

  // Simulamos la entrega de un Token JWT
  return {
    mensaje: "Login exitoso",
    token: `fake-jwt-token-${usuario.id}`,
    usuario: { nombre: usuario.nombre, rol: usuario.rol }
  };
};