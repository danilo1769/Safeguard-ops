import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import MapaViewer from '../../components/MapaViewer';
import Layout from '../../components/Layout';

export default function GuardDashboard() {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [misTurnos, setMisTurnos] = useState<any[]>([]);

  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const vigilanteId = encodeURIComponent(String(usuarioLocal.id || ''));

  useEffect(() => { cargarMisTurnos(); }, []);

  const cargarMisTurnos = async () => {
    if (!vigilanteId) { setError('Sesión expirada.'); return; }
    try {
      const data = await apiCall(`/turnos/vigilante/${vigilanteId}`, null, 'GET');
      setMisTurnos(data); setError(''); 
    } catch (err: any) { setError(`Error interno: ${err.message}`); }
  };

  const handleAction = (tipo: 'in' | 'out', turnoId: string) => {
    setError(''); setMensaje(''); setCargando(true);
    if (!navigator.geolocation) { setError('Geolocalización no soportada en este dispositivo.'); setCargando(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const endpoint = tipo === 'in' ? '/turnos/clock-in' : '/turnos/clock-out';
          const res = await apiCall(endpoint, { turnoId, latVigilante: pos.coords.latitude, lngVigilante: pos.coords.longitude });
          setMensaje(res.mensaje);
          cargarMisTurnos(); 
        } catch (err: any) { setError(err.message); } 
        finally { setCargando(false); }
      },
      (err) => { setError(`GPS Inaccesible: ${err.message}`); setCargando(false); },
      { enableHighAccuracy: true }
    );
  };

  const horasTotales = misTurnos.reduce((total, turno) => total + (turno.horasEfectivas || 0), 0);
  
  // SOLUCIÓN AL DATA BLOAT: Separación de Información
  const turnosActivos = misTurnos.filter(t => t.estado !== 'Completado' && t.estado !== 'Ausencia Reportada');
  const historialTurnos = misTurnos.filter(t => t.estado === 'Completado' || t.estado === 'Ausencia Reportada');

  return (
    <Layout titulo="Módulo Operativo (Vigilancia)">
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--info)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Turnos Programados</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>{turnosActivos.length}</h2>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--success)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Horas Auditadas (Mes)</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: 'var(--success)' }}>{horasTotales.toFixed(1)} <span style={{fontSize: '14px', color: 'gray'}}>Hrs</span></h2>
        </div>
      </div>

      {mensaje && <div style={{ padding: '12px', background: '#d4edda', color: '#155724', borderLeft: '4px solid var(--success)', marginBottom: '15px', fontSize: '14px' }}>{mensaje}</div>}
      {error && <div style={{ padding: '12px', background: '#f8d7da', color: '#721c24', borderLeft: '4px solid var(--danger)', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* SECCIÓN 1: OPERACIÓN ACTIVA */}
        <div style={{ flex: '1 1 350px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>ASIGNACIONES ACTIVAS</h3>
          {turnosActivos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sin asignaciones operativas pendientes.</p>
          ) : (
            turnosActivos.map(turno => (
              <div key={turno.id} className="card" style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '14px' }}>{new Date(turno.horaInicio).toLocaleDateString()}</strong>
                  <span className={`badge badge-${turno.estado.toLowerCase().replace(' ', '')}`}>{turno.estado}</span>
                </div>
                <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>Inicio:</strong> {new Date(turno.horaInicio).toLocaleTimeString()}</p>
                <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>Fin Estimado:</strong> {new Date(turno.horaFinEstimada).toLocaleTimeString()}</p>
                
                <MapaViewer latitud={turno.latitudPuesto} longitud={turno.longitudPuesto} />

                <div style={{ marginTop: '15px' }}>
                  {turno.estado === 'Pendiente' && (
                    <button onClick={() => handleAction('in', turno.id)} disabled={cargando} className="btn btn-primary" style={{ width: '100%' }}>
                      {cargando ? 'PROCESANDO...' : 'REGISTRAR INGRESO (CLOCK-IN)'}
                    </button>
                  )}
                  {turno.estado === 'En turno' && (
                    <button onClick={() => handleAction('out', turno.id)} disabled={cargando} className="btn btn-danger" style={{ width: '100%' }}>
                      {cargando ? 'PROCESANDO...' : 'REGISTRAR SALIDA (CLOCK-OUT)'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* SECCIÓN 2: HISTORIAL (SCROLLABLE) */}
        <div style={{ flex: '2 1 400px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>BITÁCORA DE SERVICIOS</h3>
          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="modern-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th>Fecha</th>
                  <th>Horario Verificado</th>
                  <th>Horas</th>
                  <th>Estado Final</th>
                </tr>
              </thead>
              <tbody>
                {historialTurnos.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'gray' }}>No hay registros históricos.</td></tr>
                ) : (
                  historialTurnos.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.horaInicio).toLocaleDateString()}</td>
                      <td>
                        {new Date(t.horaInicio).toLocaleTimeString()} - <br/>
                        {t.horaFin ? new Date(t.horaFin).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td><strong>{t.horasEfectivas || 0}</strong></td>
                      <td><span className={`badge badge-${t.estado.toLowerCase().replace(' ', '')}`}>{t.estado}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}