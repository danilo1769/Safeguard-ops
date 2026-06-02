import { useNavigate } from 'react-router-dom';

export default function Layout({ children, titulo }: { children: React.ReactNode, titulo: string }) {
  const navigate = useNavigate();
  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAVBAR CORPORATIVO */}
      <header style={{ background: 'var(--primary-color)', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', height: '60px', borderBottom: '4px solid var(--danger)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '1px' }}>SERACIS</h1>
          <span style={{ fontSize: '13px', color: '#ccc', borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>SafeGuard Ops - {titulo}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{usuarioLocal.nombre}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#adb5bd', textTransform: 'uppercase' }}>{usuarioLocal.rol}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'white', color: 'white', padding: '6px 12px' }}>
            CERRAR SESIÓN
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ padding: '30px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
}