const API_URL = 'http://localhost:3000/api';

export const apiCall = async (endpoint: string, data?: any, method: string = 'POST') => {
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // BLINDAJE PRO-CODE: Revisamos qué nos mandó el servidor ANTES de intentar leerlo
  const contentType = response.headers.get("content-type");
  
  if (contentType?.includes("application/json")) {
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Error en la petición');
    return json;
  } else {
    // Si el servidor mandó HTML (<!DOCTYPE...>), capturamos el texto y lanzamos un error claro
    const textoHtml = await response.text();
    console.error("El servidor respondió con HTML en lugar de JSON:", textoHtml);
    throw new Error(`Error de conexión (Ruta no encontrada o servidor caído). Status: ${response.status}`);
  }
};