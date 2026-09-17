import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
})
