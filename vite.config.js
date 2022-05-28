import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: "/beta/",
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  server: {
    fs: {
      allow: ["..", "../../Origami"]
    }
  },
});
