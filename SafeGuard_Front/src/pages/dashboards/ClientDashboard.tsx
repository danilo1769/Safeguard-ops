import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import MapaSelector from '../../components/MapaSelector';
import Layout from '../../components/Layout';

export default function ClientDashboard() {
  const [ubicacion, setUbicacion] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [latitud, setLatitud] = useState('6.1759');
  const [longitud, setLongitud] = useState('-75.5901');
  const [mensaje, setMensaje] = useState('');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  const clienteId = encodeURIComponent(String(usuarioLocal.id || ''));

  useEffect(() => {
    cargarSolicitudes();
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
    e.preventDefault(); setMensaje('');
    try {
      await apiCall('/solicitudes/crear', { clienteId: usuarioLocal.id, ubicacion, horaInicio, horaFin, latitud: Number.parseFloat(latitud), longitud: Number.parseFloat(longitud) });
      setMensaje('Requerimiento de servicio ingresado al sistema.');
      cargarSolicitudes();
    } catch (err: any) { setMensaje(`Error de procesamiento: ${err.message}`); }
  };

  const handleReportarSLA = async (turnoId: string) => {
    try {
      const res = await apiCall('/turnos/reportar-ausencia', { turnoId });
      setMensaje(`Alerta SLA: ${res.mensaje}`);
      cargarSolicitudes(); 
    } catch (err: any) { setMensaje(`Fallo de conexión: ${err.message}`); }
  };

  const hanPasado15Minutos = (fechaInicio: string) => {
    return (ahora - new Date(fechaInicio).getTime()) >= (15 * 60 * 1000);
  };

  const solicitadasActivas = solicitudes.filter(s => s.estado === 'Pendiente' || (s.estado === 'Asignado' && s.turno?.estado !== 'Completado' && s.turno?.estado !== 'Ausencia Reportada'));
  const historialServicios = solicitudes.filter(s => s.estado === 'Expirado' || s.turno?.estado === 'Completado' || s.turno?.estado === 'Ausencia Reportada');

  return (
    <Layout titulo="Portal de Contratación">
      {mensaje && <div style={{ padding: '12px', background: '#d4edda', color: '#155724', borderLeft: '4px solid var(--success)', marginBottom: '15px', fontSize: '14px' }}>{mensaje}</div>}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* PANEL IZQUIERDO: NUEVO REQUERIMIENTO */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>NUEVO REQUERIMIENTO OPERATIVO</h3>
            <form onSubmit={handleCrearSolicitud}>
              <div className="form-group">
                <label htmlFor="reqUbicacion">Nombre de la Instalación</label>
                <input id="reqUbicacion" type="text" className="input-control" required value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="reqInicio">Apertura de Turno</label>
                  <input id="reqInicio" type="datetime-local" className="input-control" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="reqFin">Cierre de Turno</label>
                  <input id="reqFin" type="datetime-local" className="input-control" required value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="reqUbicacionMapa">Geoposición de la Instalación</label>
                <input id="reqUbicacionMapa" type="text" readOnly value={`${latitud},${longitud}`} style={{position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', border: 0, padding: 0}} aria-label="Coordenadas de la instalación" />
                <MapaSelector latitud={Number.parseFloat(latitud)} longitud={Number.parseFloat(longitud)} onLocationSelect={(lat, lng) => { setLatitud(lat.toString()); setLongitud(lng.toString()); }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>EMITIR ORDEN DE SERVICIO</button>
            </form>
          </div>
        </div>

        {/* PANEL DERECHO: SEGUIMIENTO Y AUDITORÍA */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ margin: 0, padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '15px' }}>MONITOREO DE SERVICIOS ACTIVOS</h3>
            <div className="table-container">
              <table className="modern-table">
                <thead><tr><th>Instalación</th><th>Despliegue</th><th>Estado Operativo</th><th>Auditoría SLA</th></tr></thead>
                <tbody>
                  {solicitadasActivas.length === 0 ? (<tr><td colSpan={4} style={{ textAlign: 'center' }}>Sin operaciones activas.</td></tr>) : (
                    solicitadasActivas.map(s => (
                      <tr key={s.id}>
                        <td>{s.ubicacion}</td>
                        <td>{new Date(s.horaInicio).toLocaleString()}</td>
                        <td><span className="badge badge-pendiente">{s.turno ? s.turno.estado : s.estado}</span></td>
                        <td>
                          {s.estado === 'Asignado' && s.turno?.estado === 'Pendiente' && hanPasado15Minutos(s.horaInicio) ? (
                            <button onClick={() => handleReportarSLA(s.turno.id)} className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 8px' }}>
                              REPORTAR AUSENCIA
                            </button>
                          ) : <span style={{ color: '#ccc', fontSize: '11px' }}>DENTRO DE PARÁMETROS</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <h3 style={{ margin: 0, padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', fontSize: '15px' }}>HISTORIAL DE CONTRATACIÓN</h3>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="modern-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>Instalación</th><th>Fecha</th><th>Estado Final</th></tr></thead>
                <tbody>
                  {historialServicios.length === 0 ? (<tr><td colSpan={3} style={{ textAlign: 'center' }}>Sin registros históricos.</td></tr>) : (
                    historialServicios.map(s => (
                      <tr key={s.id}>
                        <td>{s.ubicacion}</td>
                        <td>{new Date(s.horaInicio).toLocaleDateString()}</td>
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