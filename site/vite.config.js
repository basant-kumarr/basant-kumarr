import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssMinify: true,
    minify: 'esbuild',
    target: 'es2020',
    reportCompressedSize: true
  }
});
