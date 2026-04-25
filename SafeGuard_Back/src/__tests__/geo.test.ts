import { describe, it, expect } from 'vitest';
import { calcularDistanciaHaversine } from '../utils/geo';

describe('Geo Utils - Fórmula de Haversine', () => {
  
  it('Debe retornar 0 metros si las coordenadas son exactamente las mismas', () => {
    // Act (Actuar)
    const distancia = calcularDistanciaHaversine(6.1759, -75.5901, 6.1759, -75.5901);
    
    // Assert (Afirmar)
    expect(distancia).toBe(0);
  });

  it('Debe calcular una distancia mayor a 100m para dos ciudades distintas', () => {
    // Envigado (IUE) vs Centro de Medellín
    const distancia = calcularDistanciaHaversine(6.1759, -75.5901, 6.2442, -75.5812);
    
    // Assert
    expect(distancia).toBeGreaterThan(100);
  });
});