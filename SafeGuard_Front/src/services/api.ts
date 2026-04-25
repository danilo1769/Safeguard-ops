const API_URL = 'http://localhost:3000/api';

export const apiCall = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Error en la petición');
  return json;
};