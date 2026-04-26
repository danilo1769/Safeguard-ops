import { useState } from 'react';
import { apiCall } from '../../services/api';

export default function GuardDashboard() {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // En la vida real el backend me daría solo mis turnos, 
  // aquí simularemos traer el ID del usuario logueado.
  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  // Por ahora, para poder probar el flujo sin crear otro endpoint,
  // permitiremos que el vigilante ponga el ID del turno que el Admin le asignó
  const [turnoIdInput, setTurnoIdInput] = useState('');

  const handleAction = (tipo: 'in' | 'out') => {
    if (!turnoIdInput) {
      setError('Por favor, ingresa el ID de tu turno (búscalo en el panel admin para la prueba).');
      return;
    }

    setError('');
    setMensaje('');
    setCargando(true);

    if (tipo === 'in') {
      // Flujo GPS (Clock-in)
      if (!navigator.geolocation) {
        setError('Tu navegador no soporta geolocalización.');
        setCargando(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (posicion) => {
          try {
            const res = await apiCall('/turnos/clock-in', {
              turnoId: turnoIdInput,
              latVigilante: posicion.coords.latitude,
              lngVigilante: posicion.coords.longitude
            });
            setMensaje(`✅ ${res.mensaje}`);
          } catch (err: any) { setError(`❌ ${err.message}`); } 
          finally { setCargando(false); }
        },
        (errGeo) => {
          setError(`Error de GPS: ${errGeo.message}`);
          setCargando(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      // Flujo Clock-out
      apiCall('/turnos/clock-out', { turnoId: turnoIdInput })
        .then(res => setMensaje(`🏁 ${res.mensaje}`))
        .catch(err => setError(`❌ ${err.message}`))
        .finally(() => setCargando(false));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <h2>Dashboard del Vigilante 🛡️</h2>
      <p>Bienvenido, Guardia {usuarioLocal.nombre}</p>
      
      <div style={{ margin: '30px 0', padding: '20px', border: '2px dashed #ccc' }}>
        <p>Para esta prueba, ingresa el ID del turno que te asignó el administrador:</p>
        <input 
          type="text" 
          placeholder="Ej. 123e4567-e89b-12d3..." 
          value={turnoIdInput}
          onChange={(e) => setTurnoIdInput(e.target.value)}
          style={{ padding: '10px', width: '80%', marginBottom: '20px' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button 
            onClick={() => handleAction('in')} disabled={cargando}
            style={{ padding: '15px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            📍 Marcar Llegada
          </button>

          <button 
            onClick={() => handleAction('out')} disabled={cargando}
            style={{ padding: '15px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            🏁 Finalizar Turno
          </button>
        </div>
      </div>

      {mensaje && <h3 style={{ color: 'green' }}>{mensaje}</h3>}
      {error && <h3 style={{ color: 'red' }}>{error}</h3>}
    </div>
  );
}