// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        '.',
        'src/assets',
        'src', // Add this line to include the src directory
        'node_modules'
      ]
    }
  }
});
