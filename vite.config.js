import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative asset paths so the built app can be hosted from any
  // sub-path (GitHub Pages project sites, static hosts, etc.).
  base: './',
})
