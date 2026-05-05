// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuardDashboard from '../pages/dashboards/GuardDashboard';
import * as api from '../services/api';

vi.mock('../services/api');
vi.mock('../components/MapaViewer', () => ({ default: () => <div>Mapa</div> }));

describe('Dashboard Guardia (UI)', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'VIG-1', nombre: 'Batman' }));
    
    // Simulamos el GPS del navegador
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => 
        success({ coords: { latitude: 6.01, longitude: -75.01 } })
      )
    };
    (globalThis.navigator as any).geolocation = mockGeolocation;
  });

  it('Debe renderizar los turnos del guardia', async () => {
    vi.mocked(api.apiCall).mockResolvedValue([{
      id: 'T1', horaInicio: '2030-01-01T10:00:00Z', estado: 'Pendiente', latitudPuesto: 0, longitudPuesto: 0
    }]);

    render(<GuardDashboard />);
    
    expect(await screen.findByText(/Mi Agenda/i)).toBeTruthy();
    expect(await screen.findByText(/📍 Marcar Llegada/i)).toBeTruthy();
  });

  it('Debe hacer Clock-in exitosamente', async () => {
    // 1ro carga la tabla, 2do responde el clock-in, 3ro recarga la tabla
    vi.mocked(api.apiCall)
      .mockResolvedValueOnce([{ id: 'T1', horaInicio: '2030-01-01', estado: 'Pendiente' }])
      .mockResolvedValueOnce({ mensaje: 'Llegada exitosa' })
      .mockResolvedValueOnce([]);

    render(<GuardDashboard />);
    
    const btn = await screen.findByText('📍 Marcar Llegada');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/turnos/clock-in', expect.any(Object));
      expect(screen.getByText('✅ Llegada exitosa')).toBeTruthy();
    });
  });
});