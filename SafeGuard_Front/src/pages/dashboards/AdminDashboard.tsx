import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [vigilantes, setVigilantes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [selecciones, setSelecciones] = useState<{ [key: string]: string }>({});

  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      // Como el Admin no recibe ID por parámetro en este endpoint, hacemos un GET normal
      const data = await apiCall('/admin/panel', null, 'GET');
      setSolicitudes(data.solicitudesPendientes);
      setVigilantes(data.vigilantes);
      setError('');
    } catch (err: any) { setError(`Error de conexión con el Centro de Mando: ${err.message}`); }
  };

  const handleSeleccion = (solicitudId: string, vigilanteId: string) => {
    setSelecciones({ ...selecciones, [solicitudId]: vigilanteId });
  };

  const handleAsignar = async (solicitudId: string) => {
    setMensaje(''); setError('');
    const vigilanteId = selecciones[solicitudId];
    
    if (!vigilanteId) { setError('Selecciona un vigilante primero.'); return; }

    try {
      await apiCall('/admin/asignar', { solicitudId, vigilanteId });
      setMensaje('✅ Turno asignado. El vigilante ha sido notificado en su App.');
      cargarDatos(); // Recargar KPIs y Tablas
    } catch (err: any) { setError(`❌ ${err.message}`); }
  };

  // KPIs Calculados en tiempo real
  const guardiasDisponibles = vigilantes.length;
  const serviciosPendientes = solicitudes.length;

  const handleDescargarReporte = async () => {
    setMensaje(''); setError('');
    try {
      const response = await fetch('http://localhost:3000/api/admin/reporte-nomina');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // Convertimos la respuesta en un Archivo (Blob)
      const blob = await response.blob();
      const url = globalThis.URL.createObjectURL(blob);
      
      // Truco Pro-Code: Creamos un <a> invisible, le hacemos clic y lo borramos
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Reporte_Nomina_SafeGuard.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.URL.revokeObjectURL(url); // Limpiamos memoria

      setMensaje('✅ Reporte descargado exitosamente.');
    } catch (err: any) {
      setError(`❌ Error al descargar: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER TIPO PANEL DE CONTROL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#343a40', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Centro de Comando (Admin) 🌍</h2>
          <p style={{ margin: '5px 0 0 0', color: '#adb5bd' }}>Operador: {usuarioLocal.nombre}</p>
        </div>
        
        {/* INDICADORES CLAVE (KPIs) */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center', background: '#495057', padding: '10px 20px', borderRadius: '5px' }}>
            <h3 style={{ margin: 0, color: '#ffc107' }}>{serviciosPendientes}</h3>
            <span style={{ fontSize: '12px' }}>Peticiones</span>
          </div>
          <div style={{ textAlign: 'center', background: '#495057', padding: '10px 20px', borderRadius: '5px' }}>
            <h3 style={{ margin: 0, color: '#17a2b8' }}>{guardiasDisponibles}</h3>
            <span style={{ fontSize: '12px' }}>Guardias en Stock</span>
          </div>
          <button onClick={handleDescargarReporte} style={{ padding: '15px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', height: 'fit-content' }}>
            📊 Descargar Nómina
          </button>
        </div>
      </div>

      {mensaje && <div style={{ padding: '12px', background: '#d4edda', color: '#155724', borderLeft: '5px solid #28a745', marginBottom: '15px' }}>{mensaje}</div>}
      {error && <div style={{ padding: '12px', background: '#f8d7da', color: '#721c24', borderLeft: '5px solid #dc3545', marginBottom: '15px' }}>{error}</div>}

      {/* SECCIÓN DE ASIGNACIÓN */}
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: 0, padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>📋 Solicitudes Pendientes de Asignación</h3>
        
        {solicitudes.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>Excelente trabajo. No hay solicitudes pendientes.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', fontSize: '14px', color: '#495057' }}>
                <th style={{ padding: '12px 15px' }}>📍 Ubicación</th>
                <th style={{ padding: '12px 15px' }}>⏱️ Horario</th>
                <th style={{ padding: '12px 15px' }}>🛡️ Seleccionar Guardia</th>
                <th style={{ padding: '12px 15px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <strong>{s.ubicacion}</strong><br/>
                    <span style={{ fontSize: '11px', color: 'gray' }}>GPS: {s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}</span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '13px' }}>
                    {new Date(s.horaInicio).toLocaleString()} <br/> 
                    <span style={{ color: 'gray' }}>hasta {new Date(s.horaFin).toLocaleTimeString()}</span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <select 
                      role="combobox"
                      onChange={(e) => handleSeleccion(s.id, e.target.value)}
                      value={selecciones[s.id] || ""}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="" disabled>-- Asignar recurso --</option>
                      {vigilantes.map(v => (
                        <option key={v.id} value={v.id}>💂 {v.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      onClick={() => handleAsignar(s.id)}
                      style={{ padding: '8px 15px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
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
    </div>
  );
}