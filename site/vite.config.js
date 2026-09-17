import { defineConfig } from 'vite';

export default defineConfig({
  // '/' for Netlify. GitHub Pages project sites set VITE_BASE=/basant-kumarr/
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssMinify: true,
    minify: 'esbuild',
    target: 'es2020',
    reportCompressedSize: true
  }
});
