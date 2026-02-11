import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  publicDir: 'public',
  ssr: {
    noExternal: true,
  },
  optimizeDeps: {
    exclude: ['mind-ar'],
  },
})
