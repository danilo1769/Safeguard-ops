import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [vigilantes, setVigilantes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  
  // Estado para saber qué guardia seleccionó el admin para cada solicitud
  const [selecciones, setSelecciones] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/panel');
      const data = await response.json();
      setSolicitudes(data.solicitudesPendientes);
      setVigilantes(data.vigilantes);
    } catch (err) {
      console.error('Error cargando panel admin', err);
    }
  };

  const handleSeleccionGuardia = (solicitudId: string, vigilanteId: string) => {
    setSelecciones({ ...selecciones, [solicitudId]: vigilanteId });
  };

  const handleAsignar = async (solicitudId: string) => {
    setMensaje('');
    const vigilanteId = selecciones[solicitudId];
    
    if (!vigilanteId) {
      setMensaje('❌ Selecciona un vigilante primero.');
      return;
    }

    try {
      await apiCall('/admin/asignar', { solicitudId, vigilanteId });
      setMensaje('✅ Turno asignado con éxito. El guardia ha sido notificado.');
      cargarDatos(); // Recargar la tabla para que desaparezca la solicitud pendiente
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      <h2>Centro de Comando Administrativo 🌐</h2>
      <p>Bienvenido. Aquí gestionas la operación de SafeGuard Ops.</p>

      {mensaje && <div style={{ padding: '10px', background: '#e2f3e5', border: '1px solid #28a745', marginBottom: '20px' }}>
        <strong>{mensaje}</strong>
      </div>}

      <h3>Solicitudes Pendientes de Asignación</h3>
      
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes. ¡Todo está bajo control!</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#343a40', color: 'white' }}>
              <th style={{ padding: '10px' }}>Ubicación</th>
              <th style={{ padding: '10px' }}>Fecha/Hora</th>
              <th style={{ padding: '10px' }}>Asignar Vigilante</th>
              <th style={{ padding: '10px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '10px' }}>{s.ubicacion}</td>
                <td style={{ padding: '10px' }}>{new Date(s.horaInicio).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <select 
                    onChange={(e) => handleSeleccionGuardia(s.id, e.target.value)}
                    value={selecciones[s.id] || ""}
                    style={{ padding: '5px', width: '100%' }}
                  >
                    <option value="" disabled>-- Selecciona Vigilante --</option>
                    {vigilantes.map(v => (
                      <option key={v.id} value={v.id}>{v.nombre}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => handleAsignar(s.id)}
                    style={{ padding: '8px 15px', background: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    Asignar Turno
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}