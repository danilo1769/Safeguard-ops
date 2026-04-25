import { PrismaClient } from '@prisma/client';

// Instanciamos la conexión a nuestra base de datos SQLite real
export const prisma = new PrismaClient();