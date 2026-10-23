import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base keeps asset paths working on Netlify and in subfolders.
  base: './',
  // three.js alone is ~700 kB; split into chunks later when more scenes exist.
  build: { chunkSizeWarningLimit: 1500 },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
