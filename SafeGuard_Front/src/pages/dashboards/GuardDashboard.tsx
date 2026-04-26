import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import MapaViewer from '../../components/MapaViewer';

export default function GuardDashboard() {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [misTurnos, setMisTurnos] = useState<any[]>([]);

  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const vigilanteId = usuarioLocal.id;

  useEffect(() => { cargarMisTurnos(); }, []);

  const cargarMisTurnos = async () => {
    if (!vigilanteId) { setError('Sesión expirada.'); return; }
    try {
      const data = await apiCall(`/turnos/vigilante/${vigilanteId}`, null, 'GET');
      setMisTurnos(data);
      setError(''); 
    } catch (err: any) { setError(`Error al cargar turnos: ${err.message}`); }
  };

  const handleAction = (tipo: 'in' | 'out', turnoId: string) => {
    setError(''); setMensaje(''); setCargando(true);
    if (!navigator.geolocation) { setError('Tu celular no soporta GPS.'); setCargando(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const endpoint = tipo === 'in' ? '/turnos/clock-in' : '/turnos/clock-out';
          const res = await apiCall(endpoint, { turnoId, latVigilante: pos.coords.latitude, lngVigilante: pos.coords.longitude });
          setMensaje(tipo === 'in' ? `✅ ${res.mensaje}` : `🏁 ${res.mensaje}`);
          cargarMisTurnos(); 
        } catch (err: any) { setError(`❌ ${err.message}`); } 
        finally { setCargando(false); }
      },
      (err) => { setError(`Error GPS: ${err.message}`); setCargando(false); },
      { enableHighAccuracy: true }
    );
  };

  // CÁLCULO PRO-CODE: Sumamos todas las horas efectivas de los turnos completados
  const horasTotales = misTurnos.reduce((total, turno) => total + (turno.horasEfectivas || 0), 0);

  // FIX SONARQUBE: Función limpia para obtener el color del estado
  const getColorPorEstado = (estado: string) => {
    if (estado === 'Completado') return 'green';
    if (estado === 'En turno') return 'blue';
    return 'orange'; // Pendiente u otros
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      
      {/* CABECERA CON ESTADÍSTICAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Mi Agenda 🛡️</h2>
          <p style={{ margin: '5px 0 0 0' }}>Agente: <strong>{usuarioLocal.nombre}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#adb5bd' }}>Horas Acumuladas</p>
          <h2 style={{ margin: 0, color: '#28a745' }}>{horasTotales.toFixed(1)} h</h2>
        </div>
      </div>

      {mensaje && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', marginBottom: '15px', borderRadius: '5px' }}>{mensaje}</div>}
      {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', marginBottom: '15px', borderRadius: '5px' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {misTurnos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'gray' }}>No tienes turnos asignados para hoy. Descansa.</p>
        ) : (
          misTurnos.map(turno => (
            <div key={turno.id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', background: turno.estado === 'Completado' ? '#f8f9fa' : '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>{new Date(turno.horaInicio).toLocaleDateString()}</strong>
                <span style={{ color: getColorPorEstado(turno.estado), fontWeight: 'bold' }}>
                  {turno.estado}
                </span>
              </div>

              <p style={{ margin: '5px 0' }}>🕒 <strong>Horario:</strong> {new Date(turno.horaInicio).toLocaleTimeString()} - {new Date(turno.horaFinEstimada).toLocaleTimeString()}</p>
              
              {/* AQUÍ VIVE EL MINI MAPA */}
              <MapaViewer latitud={turno.latitudPuesto} longitud={turno.longitudPuesto} />

              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                {turno.estado === 'Pendiente' && (
                  <button onClick={() => handleAction('in', turno.id)} disabled={cargando} style={{ width: '100%', padding: '12px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {cargando ? 'Verificando GPS...' : '📍 Marcar Llegada'}
                  </button>
                )}

                {turno.estado === 'En turno' && (
                  <button onClick={() => handleAction('out', turno.id)} disabled={cargando} style={{ width: '100%', padding: '12px', background: '#DC3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {cargando ? 'Calculando...' : '🏁 Finalizar Turno'}
                  </button>
                )}

                {turno.estado === 'Completado' && (
                  <p style={{ color: 'green', margin: 0, fontWeight: 'bold' }}>✅ +{turno.horasEfectivas} horas acreditadas</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}