import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); setError('');
    try {
      const data = await apiCall('/auth/login', { email, password });
      
      const usuarioSanitizado = {
        id: String(data.usuario.id),
        nombre: String(data.usuario.nombre).replace(/[<>]/g, ""), 
        rol: String(data.usuario.rol)
      };

      localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioSanitizado));

      if (usuarioSanitizado.rol === 'Administrativo') navigate('/dashboard-admin');
      else if (usuarioSanitizado.rol === 'Contratante') navigate('/dashboard-cliente');
      else navigate('/dashboard-vigilante');

    } catch (err: any) { setError(err.message); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', borderTop: '4px solid var(--primary-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '28px' }}>SERACIS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Plataforma Operativa</p>
        </div>

        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '10px', textAlign: 'center', marginBottom: '15px', fontSize: '13px', borderRadius: '3px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
            <div className="form-group">
            <label htmlFor="emailInput">Correo Electrónico</label>
            <input id="emailInput" type="email" className="input-control" placeholder="usuario@seracis.com" required onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="passwordInput">Contraseña</label>
            <input id="passwordInput" type="password" className="input-control" placeholder="••••••••" required onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>INGRESAR AL SISTEMA</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '13px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <Link to="/register" style={{ color: 'var(--secondary-color)', textDecoration: 'none' }}>Solicitar Acceso</Link>
        </div>
      </div>
    </div>
  );
}