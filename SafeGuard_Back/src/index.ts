import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes'; // <-- IMPORTA ESTO
import { prisma } from './config/db';
import turnoRoutes from './routes/turno.routes';
import solicitudRoutes from './routes/solicitud.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en puerto ${PORT}`);
});