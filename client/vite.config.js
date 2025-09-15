import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { API_URL } from './src/context/Api'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target:`${API_URL}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `${API_URL}`,
        ws: true,
      }
    }
  }
})
