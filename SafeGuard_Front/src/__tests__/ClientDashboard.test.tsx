// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClientDashboard from '../pages/dashboards/ClientDashboard';
import * as api from '../services/api';

// FIX: Rutas correctas de un solo nivel (../)
vi.mock('../services/api');
vi.mock('../components/MapaSelector', () => ({
  default: ({ onLocationSelect }: any) => (
    <button onClick={() => onLocationSelect(6.1, -75.5)} data-testid="mock-map">Mapa Simulado</button>
  )
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom') as any),
  useNavigate: () => vi.fn(),
}));

describe('Dashboard Cliente (UI y SLA)', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'CLI-1', nombre: 'Wayne', rol: 'Contratante' }));
    vi.useFakeTimers({ toFake: ['Date'] }); 
    vi.mocked(api.apiCall).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('Debe renderizar y crear una solicitud usando el mapa simulado', async () => {
    vi.mocked(api.apiCall).mockImplementation(async (url) => {
      if (url.includes('/crear')) return { mensaje: 'Éxito' };
      return []; 
    });

    render(<BrowserRouter><ClientDashboard /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Nombre de la Instalación/i), { target: { value: 'Sede A' } });
    fireEvent.change(screen.getByLabelText(/Apertura de Turno/i), { target: { value: '2030-01-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/Cierre de Turno/i), { target: { value: '2030-01-01T18:00' } });
    fireEvent.click(screen.getByTestId('mock-map'));
    fireEvent.click(screen.getByRole('button', { name: /EMITIR ORDEN DE SERVICIO/i }));

    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/solicitudes/crear', expect.any(Object));
    });
  });

  it('Debe mostrar el botón SLA a los 15 minutos y permitir hacer clic', async () => {
    vi.setSystemTime(new Date('2030-01-01T10:20:00Z')); 

    vi.mocked(api.apiCall).mockImplementation(async (url) => {
      if (url.includes('/reportar-ausencia')) return { mensaje: 'Ausencia reportada' };
      return [{
        id: 'SOL-2', ubicacion: 'Sede B', horaInicio: '2030-01-01T10:00:00Z', estado: 'Asignado',
        turno: { id: 'TURNO-2', estado: 'Pendiente' }
      }];
    });

    render(<BrowserRouter><ClientDashboard /></BrowserRouter>);

    const botonReportar = await screen.findByText(/REPORTAR AUSENCIA/i);
    expect(botonReportar).toBeTruthy();

    fireEvent.click(botonReportar);
    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/turnos/reportar-ausencia', expect.any(Object));
    });
  });
});