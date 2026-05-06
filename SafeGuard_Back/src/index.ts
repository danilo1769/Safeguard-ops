import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes'; 
import { prisma } from './config/db';
import turnoRoutes from './routes/turno.routes';
import solicitudRoutes from './routes/solicitud.routes';
import adminRoutes from './routes/admin.routes';
import { iniciarCronJobs, detenerCronJobs } from './jobs/cron.job';

const app = express();
app.disable('x-powered-by');
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

app.use('/api/auth', authRoutes); 

app.use('/api/turnos', turnoRoutes); 

app.use('/api/solicitudes', solicitudRoutes);

app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req: Request, res: Response) => {
  const conteo = await prisma.usuario.count(); 
  res.status(200).json({ 
    estado: "OK", 
    usuariosRegistrados: conteo 
  });
});

iniciarCronJobs();

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en puerto ${PORT}`);
});

const apagadoElegante = async (signal: string) => {
  console.log(`\n[SISTEMA] Señal ${signal} recibida. Iniciando protocolo de apagado seguro...`);

  detenerCronJobs();

  await prisma.$disconnect();
  console.log('🔒 Conexión con Base de Datos cerrada con éxito.');

  server.close(() => {
    console.log('🛑 Servidor web detenido. Adiós.');
    process.exit(0); 
  });

  setTimeout(() => {
    console.error('⚠️ Forzando cierre del sistema por tiempo de espera excedido.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => apagadoElegante('SIGINT'));   
process.on('SIGTERM', () => apagadoElegante('SIGTERM')); 