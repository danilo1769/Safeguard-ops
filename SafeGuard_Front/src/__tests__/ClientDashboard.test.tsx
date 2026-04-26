import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientDashboard from '../pages/dashboards/ClientDashboard';
import * as api from '../services/api';

// 1. Mockeamos la API
vi.mock('../services/api');

// 2. MOCKEAMOS EL MAPA (Para que Vitest no explote intentando renderizar Leaflet)
vi.mock('../components/MapaSelector', () => {
  return {
    default: ({ onLocationSelect }: any) => (
      <button onClick={() => onLocationSelect(6.1, -75.5)} data-testid="mock-map">
        Mapa Simulado
      </button>
    )
  };
});

describe('Dashboard Cliente (UI)', () => {
  it('Debe renderizar y crear una solicitud usando el mapa simulado', async () => {
    // Simulamos la sesión
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'CLI-1', nombre: 'Wayne' }));
    
    // Simulamos el fetch inicial vacío
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }));
    
    // Simulamos éxito en la creación
    vi.mocked(api.apiCall).mockResolvedValue({ mensaje: 'Éxito' });

    render(<ClientDashboard />);

    // Llenamos datos
    fireEvent.change(screen.getByPlaceholderText(/Ubicación/i), { target: { value: 'Sede A' } });
    fireEvent.change(screen.getByTitle('Hora de Inicio'), { target: { value: '2030-01-01T10:00' } });
    fireEvent.change(screen.getByTitle('Hora de Fin'), { target: { value: '2030-01-01T18:00' } });

    // Simulamos clic en el mapa
    fireEvent.click(screen.getByTestId('mock-map'));

    // Enviamos formulario
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y Pedir/i }));

    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/solicitudes/crear', expect.objectContaining({
        ubicacion: 'Sede A',
        latitud: 6.1, // Lo que devolvió el mock del mapa
        longitud: -75.5
      }));
    });
  });
});