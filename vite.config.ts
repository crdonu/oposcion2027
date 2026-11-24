import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Genera sw.js con la lista de archivos de esta compilación, para abrir la app sin conexión. */
function serviceWorker(): Plugin {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter((f) => f.startsWith('assets/'));
      const build = Date.now().toString(36);
      const source = readFileSync('sw.template.js', 'utf8')
        .replace("self.__ASSETS__ || []", JSON.stringify(assets))
        .replace('__BUILD__', build);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// base relativa: funciona en GitHub Pages sea cual sea el nombre del repositorio.
export default defineConfig({
  plugins: [react(), serviceWorker()],
  base: './',
});
