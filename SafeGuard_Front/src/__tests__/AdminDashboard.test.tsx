// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import * as api from '../services/api';

vi.mock('../services/api');

describe('Admin Dashboard (UI)', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'ADMIN-1', nombre: 'Gordon' }));

    vi.mocked(api.apiCall).mockImplementation(async (url) => {
      if (url === '/admin/panel') {
        return {
          solicitudesPendientes: [{ id: 'SOL-1', ubicacion: 'Torre Stark', horaInicio: '2026-05-05T10:00', latitud: 0, longitud: 0, horaFin: '2026-05-05T18:00' }],
          vigilantes: [{ id: 'VIG-1', nombre: 'Peter Parker' }]
        };
      }
      if (url === '/admin/asignar') return { mensaje: 'Turno asignado' };
      return {};
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Debe renderizar la tabla con los datos del servidor', async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Torre Stark')).toBeTruthy();
      expect(screen.getByText('💂 Peter Parker')).toBeTruthy();
    });
  });

  it('Debe mostrar error si se intenta asignar sin seleccionar vigilante', async () => {
    render(<AdminDashboard />);
    const botonAsignar = await screen.findByText('Asignar Turno');
    fireEvent.click(botonAsignar);
    expect(await screen.findByText(/Selecciona un vigilante primero/i)).toBeTruthy();
  });

  it('Debe asignar el turno exitosamente usando la API', async () => {
    render(<AdminDashboard />);
    
    const select = await screen.findByRole('combobox'); 
    fireEvent.change(select, { target: { value: 'VIG-1' } });

    const botonAsignar = screen.getByText('Asignar Turno');
    fireEvent.click(botonAsignar);

    const mensajeExito = await screen.findByText(/Turno asignado/i);
    expect(mensajeExito).toBeTruthy();
  });

  it('Debe descargar el reporte CSV al hacer clic en el botón de Nómina', async () => {
    const mockBlob = new Blob(['Col1,Col2\nDato1,Dato2'], { type: 'text/csv' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob
    });
    vi.stubGlobal('fetch', mockFetch);

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/fake-url');
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = vi.fn();

    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreateElement(tag); 
      if (tag === 'a') element.click = mockClick; 
      return element;
    });

    render(<AdminDashboard />);
    
    const botonDescargar = await screen.findByText('📊 Descargar Nómina');
    fireEvent.click(botonDescargar);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/reporte-nomina');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled(); 
      expect(screen.getByText('✅ Reporte descargado exitosamente.')).toBeTruthy();
    });
  });
});