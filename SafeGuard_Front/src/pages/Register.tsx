import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', passwordHash: '', rol: 'Vigilante' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('');
    try {
      await apiCall('/auth/register', form);
      // Evitamos el alert del navegador (mala UX) y redirigimos
      navigate('/'); 
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px', borderTop: '4px solid var(--primary-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '24px', textTransform: 'uppercase' }}>SERACIS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Registro de Personal y Clientes</p>
        </div>

        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '10px', textAlign: 'center', marginBottom: '15px', fontSize: '13px', borderRadius: '3px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-group">
            <label htmlFor="regNombre">Nombre Completo / Razón Social</label>
            <input id="regNombre" type="text" className="input-control" required onChange={e => setForm({...form, nombre: e.target.value})} />
          </div>
          <div className="form-group">
            <label htmlFor="regEmail">Correo Electrónico</label>
            <input id="regEmail" type="email" className="input-control" required onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label htmlFor="regPassword">Contraseña Segura (Mínimo 8 caracteres)</label>
            <input id="regPassword" type="password" minLength={8} className="input-control" required onChange={e => setForm({...form, passwordHash: e.target.value})} />
          </div>
          <div className="form-group">
            <label htmlFor="regRol">Perfil de Acceso</label>
            <select id="regRol" className="input-control" onChange={e => setForm({...form, rol: e.target.value})}>
              <option value="Vigilante">Personal Operativo (Vigilante)</option>
              <option value="Administrativo">Personal Administrativo</option>
              <option value="Contratante">Cliente (Contratante)</option>
            </select>
          </div>
            <select className="input-control" onChange={e => setForm({...form, rol: e.target.value})}>
              <option value="Vigilante">Personal Operativo (Vigilante)</option>
              <option value="Administrativo">Personal Administrativo</option>
              <option value="Contratante">Cliente (Contratante)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>REGISTRAR EN EL SISTEMA</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <p style={{ color: 'var(--text-muted)' }}>¿Ya posee credenciales? <Link to="/" style={{ color: 'var(--secondary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Ingresar al portal</Link></p>
        </div>
      </div>
    </div>
  );
}