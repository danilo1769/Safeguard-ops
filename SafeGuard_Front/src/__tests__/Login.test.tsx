// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as api from '../services/api';

vi.mock('../services/api');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: () => mockNavigate };
});

describe('Vista de Login (UI)', () => {
  it('Debe renderizar el formulario correctamente', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeTruthy();
    expect(screen.getByLabelText(/Contraseña/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /INGRESAR AL SISTEMA/i })).toBeTruthy();
  });

  it('Debe mostrar un mensaje de error si el backend rechaza el login', async () => {
    vi.mocked(api.apiCall).mockRejectedValue(new Error('Credenciales inválidas'));
    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'claveMala' } });
    fireEvent.click(screen.getByRole('button', { name: /INGRESAR AL SISTEMA/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeTruthy();
    });
  });

  it('Debe redirigir al Dashboard Administrativo si el login es exitoso', async () => {
    vi.mocked(api.apiCall).mockResolvedValue({ usuario: { id: "U1", nombre: "Admin", rol: "Administrativo" } });
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'admin@seracis.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'Admin1234' } });
    fireEvent.click(screen.getByRole('button', { name: /INGRESAR AL SISTEMA/i }));

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('usuarioLogueado', expect.any(String));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard-admin'); 
    });
  });
});