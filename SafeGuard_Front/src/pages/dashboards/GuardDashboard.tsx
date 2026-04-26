import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';

export default function GuardDashboard() {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [misTurnos, setMisTurnos] = useState<any[]>([]);

  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const vigilanteId = usuarioLocal.id;

  useEffect(() => {
    cargarMisTurnos();
  }, []);

  const cargarMisTurnos = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/turnos/vigilante/${vigilanteId}`);
      const data = await response.json();
      setMisTurnos(data);
    } catch (err) {
      console.error('Error interno cargando turnos:', err); 
      setError('Error al cargar tus turnos programados.');
    }
  };

  const handleAction = (tipo: 'in' | 'out', turnoId: string) => {
    setError(''); setMensaje(''); setCargando(true);

    if (!navigator.geolocation) {
      setError('Tu celular no soporta GPS.');
      setCargando(false); return;
    }

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        try {
          const endpoint = tipo === 'in' ? '/turnos/clock-in' : '/turnos/clock-out';
          const res = await apiCall(endpoint, {
            turnoId: turnoId,
            latVigilante: posicion.coords.latitude,
            lngVigilante: posicion.coords.longitude
          });
          setMensaje(tipo === 'in' ? `✅ ${res.mensaje}` : `🏁 ${res.mensaje}`);
          cargarMisTurnos(); // Recargamos para que se actualice el estado a "En turno" o "Completado"
        } catch (err: any) { setError(`❌ ${err.message}`); } 
        finally { setCargando(false); }
      },
      (errGeo) => { setError(`Error GPS: ${errGeo.message}`); setCargando(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h2>Mi Agenda de Turnos 🛡️</h2>
      <p>Agente: <strong>{usuarioLocal.nombre}</strong></p>

      {mensaje && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', marginBottom: '15px' }}>{mensaje}</div>}
      {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', marginBottom: '15px' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '15px' }}>
        {misTurnos.length === 0 ? (
          <p>No tienes turnos asignados para hoy. Descansa.</p>
        ) : (
          misTurnos.map(turno => (
            <div key={turno.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: turno.estado === 'Completado' ? '#f4f4f4' : '#fff' }}>
              <h3>Turno: {new Date(turno.horaInicio).toLocaleString()}</h3>
              <p>📍 Coordenadas: {turno.latitudPuesto}, {turno.longitudPuesto}</p>
              <p>⏱️ Estado: <strong>{turno.estado}</strong></p>
              
              {turno.estado === 'Pendiente' && (
                <button onClick={() => handleAction('in', turno.id)} disabled={cargando}
                  style={{ padding: '10px 20px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  {cargando ? 'Verificando GPS...' : '📍 Marcar Llegada'}
                </button>
              )}

              {turno.estado === 'En turno' && (
                <button onClick={() => handleAction('out', turno.id)} disabled={cargando}
                  style={{ padding: '10px 20px', background: '#DC3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  {cargando ? 'Calculando horas...' : '🏁 Finalizar Turno'}
                </button>
              )}

              {turno.estado === 'Completado' && (
                <p style={{ color: 'green' }}>✅ Completado ({turno.horasEfectivas} horas)</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}