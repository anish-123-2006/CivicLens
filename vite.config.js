import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set base so assets load correctly when served from GitHub Pages at /CivicLens/
  base: '/CivicLens/',
  plugins: [react()],
})
