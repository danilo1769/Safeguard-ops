import { useState } from 'react';
import { apiCall } from '../../services/api';

export default function GuardDashboard() {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleClockIn = () => {
    setError('');
    setMensaje('');
    setCargando(true);

    // Usamos la API del navegador para pedir permisos de GPS
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      setCargando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const lat = posicion.coords.latitude;
        const lng = posicion.coords.longitude;

        try {
          // Llamamos a nuestro backend
          const respuesta = await apiCall('/turnos/clock-in', {
            turnoId: "TURNO-001", // Hardcodeado por ahora para la prueba
            latVigilante: lat,
            lngVigilante: lng
          });

          setMensaje(`✅ ${respuesta.mensaje} (Precisión: estabas a ${respuesta.distancia} metros)`);
        } catch (err: any) {
          setError(`❌ ${err.message}`);
        } finally {
          setCargando(false);
        }
      },
      (errGeo) => {
        // Ahora SÍ leemos la variable errGeo para darle un mejor feedback al usuario
        setError(`Error de GPS: ${errGeo.message}. Asegúrate de darle permisos al navegador.`);
        setCargando(false);
      },
      { enableHighAccuracy: true } // Pedimos la máxima precisión del GPS
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <h2>Dashboard del Vigilante 🛡️</h2>
      <p>Tu turno actual: <strong>IUE - Envigado</strong></p>
      
      <div style={{ margin: '30px 0', padding: '20px', border: '2px dashed #ccc' }}>
        <button 
          onClick={handleClockIn} 
          disabled={cargando}
          style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {cargando ? 'Obteniendo GPS...' : '📍 Marcar Llegada (Clock-in)'}
        </button>
      </div>

      {mensaje && <h3 style={{ color: 'green' }}>{mensaje}</h3>}
      {error && <h3 style={{ color: 'red' }}>{error}</h3>}
    </div>
  );
}