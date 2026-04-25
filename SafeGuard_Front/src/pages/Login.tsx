import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiCall('/auth/login', { email, password });
      
      // Guardamos en la memoria del navegador quién es el usuario actual
      localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));

      // ¡AQUÍ USAMOS TU NAVIGATE! Redirección inteligente por roles
      if (data.usuario.rol === 'Administrativo') {
        navigate('/dashboard-admin');
      } else if (data.usuario.rol === 'Contratante') {
        navigate('/dashboard-cliente');
      } else {
        navigate('/dashboard-vigilante');
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Correo electrónico" required 
          onChange={e => setEmail(e.target.value)} />
        
        <input type="password" placeholder="Contraseña" required 
          onChange={e => setPassword(e.target.value)} />
        
        <button type="submit">Entrar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
    </div>
  );
}