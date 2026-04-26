// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as api from '../services/api';

// Interceptamos la llamada al backend para no necesitar internet
vi.mock('../services/api');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate, // Atrapamos la navegación
  };
});

describe('Vista de Login (UI)', () => {
  
  it('Debe renderizar el formulario correctamente', () => {
    // Renderizamos el componente envuelto en BrowserRouter (porque usa <Link>)
    render(<BrowserRouter><Login /></BrowserRouter>);
    
    // Verificamos que los elementos existan en la pantalla
    expect(screen.getByText('Iniciar Sesión')).toBeTruthy();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeTruthy();
    expect(screen.getByPlaceholderText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
  });

  it('Debe mostrar un mensaje de error si el backend rechaza el login', async () => {
    // Simulamos que la API lanza un error
    vi.mocked(api.apiCall).mockRejectedValue(new Error('Credenciales inválidas'));

    render(<BrowserRouter><Login /></BrowserRouter>);

    // Simulamos al usuario escribiendo (FireEvent)
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'claveMala' } });
    
    // Simulamos el clic en Entrar
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // Esperamos a que React actualice la pantalla y muestre el error
    const mensajeError = await screen.findByText('Credenciales inválidas');
    expect(mensajeError).toBeTruthy();
  });

  it('Debe redirigir al Dashboard Administrativo si el login es exitoso y el rol es correcto', async () => {
    vi.mocked(api.apiCall).mockResolvedValue({
      usuario: { nombre: "Admin", rol: "Administrativo" }
    });

    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'admin@seracis.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Admin1234' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('usuarioLogueado', expect.any(String));
      // Verificamos que se llamó la redirección hacia el dashboard admin
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard-admin'); 
    });
  });

});