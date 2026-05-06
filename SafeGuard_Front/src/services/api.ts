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
  
  const contentType = response.headers.get("content-type");
  
  if (contentType?.includes("application/json")) {
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Error en la petición');
    return json;
  } else {
    const textoHtml = await response.text();
    
    const textoSeguro = textoHtml.replaceAll(/[\r\n]+/g, ' ').substring(0, 100);
    
    console.error("Respuesta inesperada del servidor (truncada):", textoSeguro);
    
    throw new Error(`Error de conexión (Ruta no encontrada). Status: ${response.status}`);
  }
};