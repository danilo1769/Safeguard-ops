import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ClientDashboard from './pages/dashboards/ClientDashboard';
import GuardDashboard from './pages/dashboards/GuardDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas de los Dashboards */}
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/dashboard-cliente" element={<ClientDashboard />} />
        <Route path="/dashboard-vigilante" element={<GuardDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;