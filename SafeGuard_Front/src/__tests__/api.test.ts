import { describe, it, expect, vi } from 'vitest';
import { apiCall } from '../services/api';

// En el frontend no queremos hacer peticiones reales a internet durante las pruebas.
// Usamos "vi.stubGlobal" para simular (mockear) la función nativa 'fetch' del navegador.
describe('API Service - Comunicación con Backend', () => {
  
  it('Debe retornar los datos en formato JSON si la petición es exitosa', async () => {
    // Simulamos que el backend responde OK
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ mensaje: "Éxito" })
    });
    vi.stubGlobal('fetch', mockFetch);

    const respuesta = await apiCall('/prueba', { dato: 1 });
    
    expect(respuesta.mensaje).toBe("Éxito");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('Debe lanzar un error si el backend responde con un status de error (ej. 401)', async () => {
    // Simulamos que el backend responde con error
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Credenciales inválidas" })
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiCall('/auth/login', {}))
      .rejects
      .toThrow("Credenciales inválidas");
  });

  it('Debe lanzar un error genérico si el backend falla sin enviar mensaje de error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}) // El backend responde vacío (sin la propiedad json.error)
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiCall('/ruta-cualquiera', {}))
      .rejects
      .toThrow("Error en la petición"); // Cae en el "Fallback" de tu OR (||)
  });
});