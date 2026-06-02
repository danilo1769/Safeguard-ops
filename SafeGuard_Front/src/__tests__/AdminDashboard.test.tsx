// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import * as api from '../services/api'; // <-- Solo un punto y slash "../"

vi.mock('../services/api');             // <-- Solo un punto y slash "../"
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom') as any),
  useNavigate: () => vi.fn(),
}));

describe('Admin Dashboard (UI)', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 'ADMIN-1', nombre: 'Gordon', rol: 'Administrativo' }));

    vi.mocked(api.apiCall).mockImplementation(async (url) => {
      if (url === '/admin/panel') {
        return {
          solicitudes: [{ id: 'SOL-1', ubicacion: 'Torre Stark', horaInicio: '2026-05-05T10:00', latitud: 0, longitud: 0, horaFin: '2026-05-05T18:00', estado: 'Pendiente' }],
          vigilantes: [{ id: 'VIG-1', nombre: 'Peter Parker' }]
        };
      }
      if (url === '/admin/asignar') return { mensaje: 'Turno asignado' };
      return {};
    });
  });

  afterEach(() => { vi.clearAllMocks(); });

  it('Debe renderizar la tabla con los datos del servidor', async () => {
    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Torre Stark')).toBeTruthy();
      expect(screen.getByText('Peter Parker')).toBeTruthy(); // Sin emoji
    });
  });

  it('Debe mostrar error si se intenta asignar sin seleccionar vigilante', async () => {
    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    const botonAsignar = await screen.findAllByRole('button', { name: /ASIGNAR/i });
    fireEvent.click(botonAsignar[0]);
    expect(await screen.findByText(/Seleccione un vigilante/i)).toBeTruthy(); // Texto nuevo
  });

  it('Debe descargar el reporte CSV al hacer clic', async () => {
    const mockBlob = new Blob(['Col1'], { type: 'text/csv' });
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob });
    vi.stubGlobal('fetch', mockFetch);

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test');
    globalThis.URL.createObjectURL = mockCreateObjectURL; // Usamos globalThis
    globalThis.URL.revokeObjectURL = vi.fn();

    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreateElement(tag);
      if (tag === 'a') element.click = mockClick;
      return element;
    });

    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    const botonDescargar = await screen.findByText(/DESCARGAR NÓMINA/i);
    fireEvent.click(botonDescargar);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/admin/reporte-nomina');
      expect(mockClick).toHaveBeenCalled(); 
    });
  });
});