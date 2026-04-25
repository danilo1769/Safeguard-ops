import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import * as api from '../services/api';

vi.mock('../services/api');

describe('Admin Dashboard (UI)', () => {

  it('Debe renderizar la tabla con los datos del servidor', async () => {
    // 1. Simulamos el fetch inicial que carga la tabla
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({
        solicitudesPendientes: [{ id: 'SOL-1', ubicacion: 'Torre Stark', horaInicio: '2026-05-05T10:00' }],
        vigilantes: [{ id: 'VIG-1', nombre: 'Peter Parker' }]
      })
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<AdminDashboard />);

    // 2. Esperamos a que la pantalla se pinte con los datos simulados
    await waitFor(() => {
      expect(screen.getByText('Torre Stark')).toBeTruthy();
      expect(screen.getByText('Peter Parker')).toBeTruthy();
    });
  });

  it('Debe mostrar error si se intenta asignar sin seleccionar vigilante', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({
        solicitudesPendientes: [{ id: 'SOL-1', ubicacion: 'Torre Stark', horaInicio: '2026-05-05T10:00' }],
        vigilantes: [{ id: 'VIG-1', nombre: 'Peter Parker' }]
      })
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<AdminDashboard />);
    
    // Esperamos que cargue
    const botonAsignar = await screen.findByText('Asignar Turno');
    
    // Hacemos clic sin seleccionar a nadie en el 'select'
    fireEvent.click(botonAsignar);

    expect(await screen.findByText('❌ Selecciona un vigilante primero.')).toBeTruthy();
  });

  it('Debe asignar el turno exitosamente usando la API', async () => {
    // 1. Simulamos el fetch inicial
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({
        solicitudesPendientes: [{ id: 'SOL-1', ubicacion: 'Torre Stark', horaInicio: '2026-05-05T10:00' }],
        vigilantes: [{ id: 'VIG-1', nombre: 'Peter Parker' }]
      })
    });
    vi.stubGlobal('fetch', mockFetch);

    // 2. ¡AQUÍ ESTAMOS LEYENDO 'api'! Simulamos que el backend responde OK al asignar
    vi.mocked(api.apiCall).mockResolvedValue({ mensaje: 'Turno asignado' });

    render(<AdminDashboard />);
    
    // 3. Esperamos que cargue el select y seleccionamos a "Peter Parker" (VIG-1)
    // Nota: Como usamos combobox (select), usamos su role de accesibilidad
    const select = await screen.findByRole('combobox'); 
    fireEvent.change(select, { target: { value: 'VIG-1' } });

    // 4. Hacemos clic en el botón asignar
    const botonAsignar = screen.getByText('Asignar Turno');
    fireEvent.click(botonAsignar);

    // 5. Verificamos que se haya mostrado el mensaje de éxito
    const mensajeExito = await screen.findByText(/Turno asignado con éxito/i);
    expect(mensajeExito).toBeTruthy();
    
    // 6. Verificamos que la API se haya llamado con los datos correctos
    expect(api.apiCall).toHaveBeenCalledWith('/admin/asignar', { 
      solicitudId: 'SOL-1', 
      vigilanteId: 'VIG-1' 
    });
  });

});