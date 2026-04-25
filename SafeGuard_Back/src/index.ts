import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes'; // <-- IMPORTA ESTO
import { usuariosDB } from './config/db';
import turnoRoutes from './routes/turno.routes';
import solicitudRoutes from './routes/solicitud.routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// <-- CONECTA LAS RUTAS AQUÍ
app.use('/api/auth', authRoutes); 

app.use('/api/turnos', turnoRoutes); 

app.use('/api/solicitudes', solicitudRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ estado: "OK", usuariosRegistrados: usuariosDB.length });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en puerto ${PORT}`);
});