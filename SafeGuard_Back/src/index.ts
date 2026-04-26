import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes'; // <-- IMPORTA ESTO
import { prisma } from './config/db';
import turnoRoutes from './routes/turno.routes';
import solicitudRoutes from './routes/solicitud.routes';
import adminRoutes from './routes/admin.routes';
import { iniciarCronJobs, detenerCronJobs } from './jobs/cron.job';

const app = express();
app.disable('x-powered-by');
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173', // Solo tu App de React puede pedir datos
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// <-- CONECTA LAS RUTAS AQUÍ
app.use('/api/auth', authRoutes); 

app.use('/api/turnos', turnoRoutes); 

app.use('/api/solicitudes', solicitudRoutes);

app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req: Request, res: Response) => {
  const conteo = await prisma.usuario.count(); // Consulta real a SQL
  res.status(200).json({ 
    estado: "OK", 
    usuariosRegistrados: conteo 
  });
});

// 1. Encendemos el Robot
iniciarCronJobs();

// 2. Encendemos el Servidor de Express, PERO lo guardamos en una variable
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en puerto ${PORT}`);
});

// 3. EL PROTOCOLO DE APAGADO ELEGANTE (Graceful Shutdown)
// Atrapamos la señal "Ctrl+C" del sistema operativo (SIGINT) o la señal de reinicio (SIGTERM)
const apagadoElegante = async (signal: string) => {
  console.log(`\n[SISTEMA] Señal ${signal} recibida. Iniciando protocolo de apagado seguro...`);

  // Paso A: Apagar el robot para que no haga consultas inesperadas
  detenerCronJobs();

  // Paso B: Cerrar la conexión limpia con la base de datos (Prisma)
  await prisma.$disconnect();
  console.log('🔒 Conexión con Base de Datos cerrada con éxito.');

  // Paso C: Dejar de aceptar peticiones web nuevas
  server.close(() => {
    console.log('🛑 Servidor web detenido. Adiós.');
    process.exit(0); // Cero significa "Salida limpia y sin errores"
  });

  // Seguro de vida: Si por alguna razón el servidor tarda más de 10 segundos en cerrar, lo matamos a la fuerza
  setTimeout(() => {
    console.error('⚠️ Forzando cierre del sistema por tiempo de espera excedido.');
    process.exit(1);
  }, 10000);
};

// Conectamos nuestros oídos a las señales del sistema operativo
process.on('SIGINT', () => apagadoElegante('SIGINT'));   // Para Ctrl+C
process.on('SIGTERM', () => apagadoElegante('SIGTERM')); // Para gestores de procesos en la Nube (Docker/Render)