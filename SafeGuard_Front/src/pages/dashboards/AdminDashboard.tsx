import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  const [todasSolicitudes, setTodasSolicitudes] = useState<any[]>([]);
  const [vigilantes, setVigilantes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [selecciones, setSelecciones] = useState<{ [key: string]: string }>({});

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const data = await apiCall('/admin/panel', null, 'GET');
      setTodasSolicitudes(data.solicitudes);
      setVigilantes(data.vigilantes);
      setError('');
    } catch (err: any) { 
      setError('Error de conexión con el servidor.');
      console.error('Error en cargarDatos:', err);
    }
  };

  const handleSeleccion = (solicitudId: string, vigilanteId: string) => { setSelecciones({ ...selecciones, [solicitudId]: vigilanteId }); };

  const handleAsignar = async (solicitudId: string) => {
    setMensaje(''); setError('');
    const vigilanteId = selecciones[solicitudId];
    if (!vigilanteId) { setError('Seleccione un vigilante para continuar.'); return; }
    try {
      await apiCall('/admin/asignar', { solicitudId, vigilanteId });
      setMensaje('TURNO ASIGNADO EXITOSAMENTE.');
      cargarDatos(); 
    } catch (err: any) { setError(`ERROR OPERATIVO: ${err.message}`); }
  };

  const handleDescargarReporte = async () => {
    setMensaje(''); setError('');
    try {
      const response = await fetch('http://localhost:3000/api/admin/reporte-nomina');
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error); }
      const blob = await response.blob();
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'Reporte_Nomina_SafeGuard.csv';
      document.body.appendChild(a); a.click(); a.remove();
      globalThis.URL.revokeObjectURL(url);
      setMensaje('REPORTE DE NÓMINA GENERADO CORRECTAMENTE.');
    } catch (err: any) { setError(`FALLO EN DESCARGA: ${err.message}`); }
  };

  // --- ESCALABILIDAD: FILTRADO DE DATOS PARA PREVENIR FATIGA VISUAL ---
  const pendientes = todasSolicitudes.filter(s => s.estado === 'Pendiente');
  const enOperacion = todasSolicitudes.filter(s => s.estado === 'Asignado' && s.turno?.estado !== 'Completado');
  const historial = todasSolicitudes.filter(s => s.estado === 'Expirado' || s.turno?.estado === 'Completado');

  return (
    <Layout titulo="Mando Central">
      
      {/* KPIS Y ACCIONES GLOBALES */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--danger)', padding: '15px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Alertas de Asignación</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{pendientes.length}</h2>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--info)', padding: '15px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Guardias en Plataforma</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{vigilantes.length}</h2>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--success)', padding: '15px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Operaciones Finalizadas</p>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{historial.length}</h2>
        </div>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <button onClick={handleDescargarReporte} className="btn btn-success" style={{ width: '100%', fontSize: '12px' }}>DESCARGAR NÓMINA (CSV)</button>
        </div>
      </div>

      {mensaje && <div style={{ padding: '12px', background: '#d4edda', color: '#155724', borderLeft: '4px solid var(--success)', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{mensaje}</div>}
      {error && <div style={{ padding: '12px', background: '#f8d7da', color: '#721c24', borderLeft: '4px solid var(--danger)', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* PANEL IZQUIERDO: ACCIÓN INMEDIATA */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ margin: 0, padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '14px' }}>REQUERIMIENTOS POR ASIGNAR</h3>
            {pendientes.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No hay requerimientos en cola.</p>
            ) : (
              <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="modern-table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>Instalación</th><th>Personal a Asignar</th><th>Acción</th></tr></thead>
                  <tbody>
                    {pendientes.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontSize: '12px' }}><strong>{s.ubicacion}</strong><br/><span style={{ color: 'gray' }}>{new Date(s.horaInicio).toLocaleString()}</span></td>
                        <td>
                          <select className="input-control" onChange={(e) => handleSeleccion(s.id, e.target.value)} value={selecciones[s.id] || ""} style={{ width: '100%', padding: '6px', fontSize: '12px' }}>
                            <option value="" disabled>-- Seleccione --</option>
                            {vigilantes.map(v => ( <option key={v.id} value={v.id}>{v.nombre}</option> ))}
                          </select>
                        </td>
                        <td><button onClick={() => handleAsignar(s.id)} className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 10px' }}>ASIGNAR</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: MONITOREO Y AUDITORÍA */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Operaciones en Curso */}
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ margin: 0, padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '14px' }}>MONITOREO EN TIEMPO REAL</h3>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="modern-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>Instalación</th><th>Agente Asignado</th><th>Estado Táctico</th></tr></thead>
                <tbody>
                  {enOperacion.length === 0 ? (<tr><td colSpan={3} style={{ textAlign: 'center', fontSize: '13px' }}>Sin operaciones activas.</td></tr>) : (
                    enOperacion.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontSize: '12px' }}><strong>{s.ubicacion}</strong></td>
                        <td style={{ fontSize: '12px' }}>{s.turno?.vigilante?.nombre || 'Desconocido'}</td>
                        <td><span className={`badge badge-${(s.turno?.estado || s.estado).toLowerCase().replace(' ', '')}`}>{s.turno?.estado || s.estado}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial General */}
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ margin: 0, padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '14px' }}>BITÁCORA HISTÓRICA GLOBAL</h3>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="modern-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>Instalación</th><th>Agente</th><th>Horas</th><th>Cierre</th></tr></thead>
                <tbody>
                  {historial.length === 0 ? (<tr><td colSpan={4} style={{ textAlign: 'center', fontSize: '13px' }}>Sin registros.</td></tr>) : (
                    historial.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontSize: '12px' }}>{s.ubicacion}</td>
                        <td style={{ fontSize: '12px' }}>{s.turno?.vigilante?.nombre || 'N/A'}</td>
                        <td style={{ fontSize: '12px' }}>{s.turno?.horasEfectivas || 0}</td>
                        <td><span className="badge badge-completado">{s.turno?.estado || s.estado}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}