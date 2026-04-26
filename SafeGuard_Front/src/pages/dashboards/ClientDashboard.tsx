import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';



export default function ClientDashboard() {
  const [ubicacion, setUbicacion] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [horaFin, setHoraFin] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  

  // Simulamos recuperar el usuario que hizo login
  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const clienteId = usuarioLocal.id;
  // Cargar solicitudes al abrir la pantalla
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/solicitudes/cliente/${clienteId}`);
      const data = await response.json();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes", err);
    }
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
      setUbicacion('');
      setHoraInicio('');
      setHoraFin('');
      setLatitud('');
      setLongitud('');
      cargarSolicitudes(); // Recargar la lista
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h2>Dashboard del Contratante 🏢</h2>
      <p>Bienvenido, {usuarioLocal.nombre}</p>

      <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
        <h3>Solicitar Nuevo Servicio de Vigilancia</h3>
        
        <form onSubmit={handleCrearSolicitud} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          <input type="text" placeholder="Ubicación (Ej. Sede Norte)" required value={ubicacion}
            onChange={e => setUbicacion(e.target.value)} />

          <input type="number" step="any" placeholder="Latitud" required value={latitud} onChange={e => setLatitud(e.target.value)} />
          
          <input type="number" step="any" placeholder="Longitud" required value={longitud} onChange={e => setLongitud(e.target.value)} />
          
          <input type="datetime-local" required value={horaInicio}
            onChange={e => setHoraInicio(e.target.value)} />

          <input type="datetime-local" title="Hora de Fin" required value={horaFin} onChange={e => setHoraFin(e.target.value)} />

          <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none' }}>
            Pedir Servicio
          </button>

        </form>

        {mensaje && <p><strong>{mensaje}</strong></p>}
      </div>

      <h3>Mis Solicitudes Activas</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>ID</th>
            <th>Ubicación</th>
            <th>Fecha/Hora Inicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length === 0 ? (
            <tr><td colSpan={4}>No tienes solicitudes.</td></tr>
          ) : (
            solicitudes.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{s.id}</td>
                <td>{s.ubicacion}</td>
                <td>{new Date(s.horaInicio).toLocaleString()}</td>
                <td style={{ color: s.estado === 'Pendiente' ? 'orange' : 'green' }}>
                  {s.estado}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}