import { describe, it, expect } from 'vitest';
import { calcularDistanciaHaversine } from '../utils/geo';

describe('Geo Utils - Fórmula de Haversine', () => {
  
  it('Debe retornar 0 metros si las coordenadas son exactamente las mismas', () => {

    const distancia = calcularDistanciaHaversine(6.1759, -75.5901, 6.1759, -75.5901);
    

    expect(distancia).toBe(0);
  });

  it('Debe calcular una distancia mayor a 100m para dos ciudades distintas', () => {
    const distancia = calcularDistanciaHaversine(6.1759, -75.5901, 6.2442, -75.5812);
    
    expect(distancia).toBeGreaterThan(100);
  });
});