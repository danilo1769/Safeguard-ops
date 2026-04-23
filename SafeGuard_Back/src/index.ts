import express = require('express');
import type { Request, Response } from 'express';
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares globales (Atributo de Interoperabilidad)
app.use(cors()); // Permite recibir peticiones del Frontend
app.use(express.json()); // Permite entender datos en formato JSON

// Endpoint de prueba
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    estado: "OK", 
    mensaje: "Servidor SafeGuard Ops funcionando al 100%" 
  });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Pro-Code corriendo en http://localhost:${PORT}`);
});