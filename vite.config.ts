import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Uses relative base './' by default so the built dist/ folder works seamlessly
// on both GitHub Pages (https://<username>.github.io/<repo>/) and Cloudflare Pages (/).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
