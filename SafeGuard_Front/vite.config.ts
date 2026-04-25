import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // <--- Agrega esto
    globals: true         // <--- Y esto
  }
} as any) // (Ponemos 'as any' para evitar un falso error de tipado temporal)