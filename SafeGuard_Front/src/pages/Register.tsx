import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', passwordHash: '', rol: 'Vigilante' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await apiCall('/auth/register', form);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/'); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Registro SafeGuard Ops</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Nombre completo" required
          onChange={e => setForm({...form, nombre: e.target.value})} />
        
        <input type="email" placeholder="Correo electrónico" required
          onChange={e => setForm({...form, email: e.target.value})} />
        
        <input type="password" placeholder="Contraseña (Min. 8 carácteres)" required minLength={8}
          onChange={e => setForm({...form, passwordHash: e.target.value})} />
        
        <select onChange={e => setForm({...form, rol: e.target.value})}>
          <option value="Vigilante">Vigilante</option>
          <option value="Administrativo">Administrativo</option>
          <option value="Contratante">Contratante (Cliente)</option>
        </select>
        
        <button type="submit">Registrarme</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link></p>
    </div>
  );
}