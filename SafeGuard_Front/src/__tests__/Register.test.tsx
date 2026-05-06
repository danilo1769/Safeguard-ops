// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import * as api from '../services/api';

vi.mock('../services/api');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom') as any),
  useNavigate: () => mockNavigate,
}));

describe('Vista de Registro', () => {
  it('Debe renderizar y enviar el formulario exitosamente', async () => {
    vi.mocked(api.apiCall).mockResolvedValue({ id: '1' });
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {}); 

    render(<BrowserRouter><Register /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'j@j.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña (Min. 8 carácteres)'), { target: { value: 'Password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    await waitFor(() => {
      expect(api.apiCall).toHaveBeenCalledWith('/auth/register', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

 it('Debe mostrar error si el backend falla', async () => {
    vi.mocked(api.apiCall).mockRejectedValue(new Error('Correo duplicado'));
    
    render(<BrowserRouter><Register /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'j@j.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña (Min. 8 carácteres)'), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    await waitFor(() => {
      expect(screen.getByText('Correo duplicado')).toBeTruthy();
    });
  });
});