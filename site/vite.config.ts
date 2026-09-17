import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2020',
    /*
     * Vite emits <link rel="modulepreload"> in index.html for the manual
     * chunks, which meant every visitor downloaded three.js up front — including
     * visitors with no WebGL at all, who never mount a scene. The 3D layer is
     * deliberately lazy, so those hints are stripped from the HTML. The runtime
     * preload that fires when the dynamic import actually runs is left alone.
     */
    modulePreload: {
      resolveDependencies: (_filename, deps, { hostType }) =>
        hostType === 'html' ? deps.filter((dep) => !/\/(three|r3f)-/.test(dep)) : deps,
    },
    // three.js is by far the largest dependency and is only needed once the
    // WebGL layer actually mounts. Keeping it in its own chunk lets the
    // readable content ship and paint before the 3D bundle arrives.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React is pinned to its own chunk first. Without this Rollup folded
          // it into the r3f chunk — which made three.js a hard static
          // dependency of the entry and downloaded it for every visitor,
          // including the ones with no WebGL who never mount a scene.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react';
          }
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
