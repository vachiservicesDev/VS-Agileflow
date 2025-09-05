import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Ensure proper MIME types for TypeScript files
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    // Force pre-bundling of these dependencies to avoid issues
    include: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    outDir: 'build/v4',
    // Improve build reliability
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
})