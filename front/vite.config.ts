import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/devops/shanify/',
  server: {
    proxy: {
      '/devops/images': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/devops/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
      }
    }
  }
})
