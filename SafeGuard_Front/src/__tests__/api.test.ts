import { describe, it, expect, vi } from 'vitest';
import { apiCall } from '../services/api';

describe('API Service - Comunicación con Backend', () => {
  
  it('Debe retornar los datos en formato JSON si la petición es exitosa', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' }, // <-- EL FIX: Simulamos la cabecera
      json: async () => ({ mensaje: "Éxito" })
    });
    vi.stubGlobal('fetch', mockFetch);

    const respuesta = await apiCall('/prueba', { dato: 1 });
    
    expect(respuesta.mensaje).toBe("Éxito");
  });

  it('Debe lanzar un error si el backend responde con un status de error (ej. 401)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => 'application/json' }, // <-- EL FIX
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
      headers: { get: () => 'application/json' }, // <-- EL FIX
      json: async () => ({}) 
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiCall('/ruta', {}))
      .rejects
      .toThrow("Error en la petición"); 
  });

  it('Debe atrapar el error si el servidor devuelve HTML (<!DOCTYPE>) en lugar de JSON', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => 'text/html' }, // Simulamos que el servidor mandó HTML
      text: async () => '<!DOCTYPE html><html>Ruta no encontrada</html>'
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiCall('/ruta-falsa', {}))
      .rejects
      .toThrow("Error de conexión (Ruta no encontrada). Status: 404");
    });

  it('Debe sanitizar el HTML recibido para prevenir Log Injection (Seguridad)', async () => {
    // 1. Espiamos la consola para ver qué intenta imprimir api.ts
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // 2. El Payload Malicioso (Más de 100 caracteres y lleno de saltos de línea \n)
    const htmlMalicioso = '<!DOCTYPE html>\n<script>\n alert("Hackeado"); \n</script>\n' + 'A'.repeat(150);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => 'text/html' },
      text: async () => htmlMalicioso
    });
    vi.stubGlobal('fetch', mockFetch);

    // 3. Ejecutamos la llamada
    await expect(apiCall('/ruta-falsa', {})).rejects.toThrow();

    // 4. VERIFICACIÓN DE SEGURIDAD (Asserts)
    const mensajeLogueado = consoleSpy.mock.calls[0][1] as string; // Capturamos lo que se imprimió
    
    // Afirmamos que NINGÚN salto de línea sobrevivió al filtro
    expect(mensajeLogueado).not.toMatch(/[\r\n]/);
    
    // Afirmamos que el texto fue truncado a máximo 100 caracteres
    expect(mensajeLogueado.length).toBeLessThanOrEqual(100);

    consoleSpy.mockRestore(); // Limpiamos el espía
  });
  
});