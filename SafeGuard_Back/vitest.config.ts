import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // @ts-ignore - Le decimos a TypeScript que no audite esta línea en la v4.1.5
    fileParallelism: false
  }
});