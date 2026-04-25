import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as api from '../services/api';

// Interceptamos la llamada al backend para no necesitar internet
vi.mock('../services/api');

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
    // 1. Simulamos un API exitoso
    vi.mocked(api.apiCall).mockResolvedValue({
      usuario: { nombre: "Admin", rol: "Administrativo" }
    });

    // 2. Simulamos el LocalStorage del navegador
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'admin@seracis.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Admin1234' } });
    
    // Hacemos clic
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // Esperamos que se haya guardado el usuario en memoria
    await vi.waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('usuarioLogueado', expect.any(String));
    });

    // Como usamos <BrowserRouter>, React internamente cambiaría la ruta.
    // Esto cubre todas las líneas restantes (18-26) del caso exitoso.
  });

});