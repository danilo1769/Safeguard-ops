// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientDashboard from '../pages/dashboards/ClientDashboard';
import * as api from '../services/api';

vi.mock('../services/api');

vi.mock('../components/MapaSelector', () => ({
  default: ({ onLocationSelect }: any) => (
    <button onClick={() => onLocationSelect(6.1, -75.5)} data-testid="mock-map">Mapa Simulado</button>
  )
}));

describe('Dashboard Cliente (UI y SLA)', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'CLI-1', nombre: 'Wayne' }));
    vi.useFakeTimers({ toFake: ['Date'] });
    
    // BLINDAJE: Por defecto, apiCall SIEMPRE devuelve un arreglo vacío 
    // para que la tabla no explote si React hace renders extra.
    vi.mocked(api.apiCall).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('Debe renderizar y crear una solicitud usando el mapa simulado', async () => {
    // Le enseñamos al mock a responder 'Éxito' solo si la ruta es '/crear'
    vi.mocked(api.apiCall).mockImplementation(async (url) => {
      if (url.includes('/crear')) return { mensaje: 'Éxito' };
      return []; // Si no es /crear, devuelve la tabla vacía
    });

    render(<ClientDashboard />);

    fireEvent.change(screen.getByPlaceholderText(/Ubicación/i), { target: { value: 'Sede A' } });
    fireEvent.change(screen.getByTitle('Hora de Inicio'), { target: { value: '2030-01-01T10:00' } });
    fireEvent.change(screen.getByTitle('Hora de Fin'), { target: { value: '2030-01-01T18:00' } });
    fireEvent.click(screen.getByTestId('mock-map'));
    
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y Pedir/i }));

    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/solicitudes/crear', expect.any(Object));
    });
  });

  it('NO debe mostrar el botón SLA si pasaron menos de 15 minutos', async () => {
    vi.setSystemTime(new Date('2030-01-01T10:10:00Z')); // Pasaron 10 mins

    // Mockeamos la tabla con 1 dato
    vi.mocked(api.apiCall).mockResolvedValue([{
      id: 'SOL-1', ubicacion: 'Sede A', horaInicio: '2030-01-01T10:00:00Z', estado: 'Asignado',
      turno: { id: 'TURNO-1', estado: 'Pendiente' }
    }]);

    render(<ClientDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sede A')).toBeTruthy();
      expect(screen.queryByText('🚨 Reportar Ausencia')).toBeNull(); // Botón invisible
    });
  });

  it('Debe mostrar el botón SLA a los 15 minutos y permitir hacer clic', async () => {
    vi.setSystemTime(new Date('2030-01-01T10:20:00Z')); // Pasaron 20 mins

    vi.mocked(api.apiCall).mockImplementation(async (url) => {
      if (url.includes('/reportar-ausencia')) return { mensaje: 'Ausencia reportada' };
      // Devolvemos la tabla
      return [{
        id: 'SOL-2', ubicacion: 'Sede B', horaInicio: '2030-01-01T10:00:00Z', estado: 'Asignado',
        turno: { id: 'TURNO-2', estado: 'Pendiente' }
      }];
    });

    render(<ClientDashboard />);

    // El botón debe aparecer
    const botonReportar = await screen.findByText('🚨 Reportar Ausencia');
    expect(botonReportar).toBeTruthy();

    fireEvent.click(botonReportar);
    
    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/turnos/reportar-ausencia', { turnoId: 'TURNO-2' });
    });
  });

  it('NO debe mostrar el botón SLA si el guardia ya hizo Clock-in', async () => {
    vi.setSystemTime(new Date('2030-01-01T10:30:00Z')); 

    vi.mocked(api.apiCall).mockResolvedValue([{
      id: 'SOL-3', ubicacion: 'Sede C', horaInicio: '2030-01-01T10:00:00Z', estado: 'Asignado',
      turno: { id: 'TURNO-3', estado: 'En turno' } // <-- ¡Llegó el guardia!
    }]);

    render(<ClientDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sede C')).toBeTruthy();
      expect(screen.queryByText('🚨 Reportar Ausencia')).toBeNull();
    });
  });
});