import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import MapaSelector from '../../components/MapaSelector';

export default function ClientDashboard() {
  const [ubicacion, setUbicacion] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [latitud, setLatitud] = useState('6.1759');
  const [longitud, setLongitud] = useState('-75.5901');
  const [mensaje, setMensaje] = useState('');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  
  // Reloj interno para evaluar los 15 minutos en tiempo real
  const [ahora, setAhora] = useState(Date.now());

  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const clienteId = usuarioLocal.id;

  useEffect(() => {
    cargarSolicitudes();
    // El reloj se actualiza cada 30 segundos para revisar si habilitamos el botón rojo
    const timer = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const cargarSolicitudes = async () => {
    if (!clienteId) return;
    try {
      const data = await apiCall(`/solicitudes/cliente/${clienteId}`, null, 'GET');
      setSolicitudes(data);
    } catch (err) { console.error("Error cargando solicitudes", err); }
  };

  const handleCrearSolicitud = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje('');
    try {
      await apiCall('/solicitudes/crear', { 
        clienteId, ubicacion, horaInicio, horaFin, 
        latitud: Number.parseFloat(latitud), longitud: Number.parseFloat(longitud) 
      });
      setMensaje('✅ Solicitud enviada correctamente');
      cargarSolicitudes();
    } catch (err: any) { setMensaje(`❌ Error: ${err.message}`); }
  };

  const handleReportarSLA = async (turnoId: string) => {
    try {
      const res = await apiCall('/turnos/reportar-ausencia', { turnoId });
      setMensaje(`🚨 ${res.mensaje}`);
      cargarSolicitudes(); // Recarga la tabla para actualizar el estado
    } catch (err: any) { setMensaje(`❌ Error: ${err.message}`); }
  };

  // Función Pro-Code: Evalúa la regla de los 15 minutos del PDF
  const hanPasado15Minutos = (fechaInicio: string) => {
    const inicioMs = new Date(fechaInicio).getTime();
    const quinceMinsMs = 15 * 60 * 1000;
    return (ahora - inicioMs) >= quinceMinsMs;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h2>Dashboard del Contratante 🏢</h2>
      <p>Bienvenido, {usuarioLocal.nombre}</p>

      {mensaje && <div style={{ padding: '10px', background: '#e2f3e5', border: '1px solid #28a745', marginBottom: '20px' }}><strong>{mensaje}</strong></div>}

      <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
        <h3>Solicitar Nuevo Servicio de Vigilancia</h3>
        <form onSubmit={handleCrearSolicitud} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Ubicación (Ej. Sede Norte)" required value={ubicacion} onChange={e => setUbicacion(e.target.value)} style={{ flex: 1, padding: '8px' }} />
            <input type="datetime-local" title="Hora de Inicio" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)} style={{ padding: '8px' }} />
            <input type="datetime-local" title="Hora de Fin" required value={horaFin} onChange={e => setHoraFin(e.target.value)} style={{ padding: '8px' }} />
          </div>

          <div style={{ width: '100%' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>📍 Haz clic en el mapa para marcar el puesto de vigilancia:</p>
            <MapaSelector latitud={Number.parseFloat(latitud)} longitud={Number.parseFloat(longitud)} onLocationSelect={(lat, lng) => { setLatitud(lat.toString()); setLongitud(lng.toString()); }} />
          </div>
          
          <button type="submit" style={{ padding: '12px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Confirmar y Pedir Servicio</button>
        </form>
      </div>

      <h3>Mis Solicitudes Activas</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Ubicación</th>
            <th>Hora Inicio</th>
            <th>Estado Sistema</th>
            <th>Acción / SLA</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length === 0 ? (<tr><td colSpan={4}>No tienes solicitudes.</td></tr>) : (
            solicitudes.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{s.ubicacion}</td>
                <td style={{ padding: '10px' }}>{new Date(s.horaInicio).toLocaleString()}</td>
                <td style={{ padding: '10px', color: s.estado === 'Pendiente' ? 'orange' : 'green' }}>
                  {/* Si tiene turno asignado, mostramos el estado del guardia, si no, el de la solicitud */}
                  {s.turno ? `Vigilante: ${s.turno.estado}` : `Solicitud: ${s.estado}`}
                </td>
                <td style={{ padding: '10px' }}>
                  {/* REGLA DEL PDF: Aparece condicionalmente a los 15 minutos */}
                  {s.estado === 'Asignado' && s.turno?.estado === 'Pendiente' && hanPasado15Minutos(s.horaInicio) ? (
                    <button onClick={() => handleReportarSLA(s.turno.id)} style={{ padding: '5px 10px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      🚨 Reportar Ausencia
                    </button>
                  ) : (
                    <span style={{ color: 'gray', fontSize: '12px' }}>Sin acciones</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}