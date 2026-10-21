import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // mapbox-gl is large on its own; keep it in a separate, long-cached chunk
    chunkSizeWarningLimit: 2000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'mapbox', test: /node_modules[\\/]mapbox-gl/ }],
        },
      },
    },
  },
})
