import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: resolve(__dirname, 'frontend/dist'),
    emptyOutDir: true,
  },
})
