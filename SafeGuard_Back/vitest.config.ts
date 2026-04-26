import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // @ts-ignore
    fileParallelism: false,
    coverage: {
      provider: 'v8',           // Motor de cobertura de Node
      reporter: ['text', 'lcov'], // 'text' es para tu terminal, 'lcov' es para SonarQube
      reportsDirectory: './coverage', // Dónde se guardará el archivo
    }
  }
});