import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Beams 的 WebGL chunk（three.js）单独按需加载，允许其体积
    chunkSizeWarningLimit: 1000,
  },
})
