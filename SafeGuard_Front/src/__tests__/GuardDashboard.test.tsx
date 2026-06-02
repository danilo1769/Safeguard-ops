// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GuardDashboard from '../pages/dashboards/GuardDashboard';
import * as api from '../services/api';

// FIX: Rutas correctas
vi.mock('../services/api');
vi.mock('../components/MapaViewer', () => ({ default: () => <div>Mapa</div> }));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom') as any),
  useNavigate: () => vi.fn(),
}));

describe('Dashboard Guardia (UI)', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'VIG-1', nombre: 'Batman', rol: 'Vigilante' }));
    
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => 
        success({ coords: { latitude: 6.01, longitude: -75.01 } })
      )
    };
    (globalThis.navigator as any).geolocation = mockGeolocation;
  });

  it('Debe renderizar los turnos del guardia', async () => {
    vi.mocked(api.apiCall).mockResolvedValue([{
      id: 'T1', horaInicio: '2030-01-01T10:00:00Z', horaFinEstimada: '2030-01-01T18:00:00Z', estado: 'Pendiente', latitudPuesto: 0, longitudPuesto: 0
    }]);

    render(<BrowserRouter><GuardDashboard /></BrowserRouter>);
    
    expect(await screen.findByText(/ASIGNACIONES ACTIVAS/i)).toBeTruthy();
    expect(await screen.findByText(/REGISTRAR INGRESO/i)).toBeTruthy(); 
  });

  it('Debe hacer Clock-in exitosamente', async () => {
    vi.mocked(api.apiCall)
      // FIX: Le ponemos latitudPuesto y longitudPuesto para que el MapaViewer no explote
      .mockResolvedValueOnce([{ id: 'T1', horaInicio: '2030-01-01T10:00:00Z', horaFinEstimada: '2030-01-01T18:00:00Z', estado: 'Pendiente', latitudPuesto: 0, longitudPuesto: 0 }])
      .mockResolvedValueOnce({ mensaje: 'Llegada exitosa' })
      .mockResolvedValueOnce([]);

    render(<BrowserRouter><GuardDashboard /></BrowserRouter>);
    
    const btn = await screen.findByText(/REGISTRAR INGRESO/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/turnos/clock-in', expect.any(Object));
      expect(screen.getByText(/Llegada exitosa/i)).toBeTruthy();
    });
  });
});