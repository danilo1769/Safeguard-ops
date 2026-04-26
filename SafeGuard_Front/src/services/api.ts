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
    // Si el servidor mandó HTML, capturamos el texto
    const textoHtml = await response.text();
    
    // FIX DE SEGURIDAD 2: Prevención de Log Injection.
    // 1. Reemplazamos todos los saltos de línea (\r y \n) por un espacio vacío.
    // 2. Limitamos el error a 100 caracteres máximo para que no desborden la memoria.
    const textoSeguro = textoHtml.replaceAll(/[\r\n]+/g, ' ').substring(0, 100);
    
    // Ahora es 100% seguro imprimirlo
    console.error("Respuesta inesperada del servidor (truncada):", textoSeguro);
    
    throw new Error(`Error de conexión (Ruta no encontrada). Status: ${response.status}`);
  }
};