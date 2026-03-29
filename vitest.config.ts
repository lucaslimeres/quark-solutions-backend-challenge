import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths'; // Adicione este import

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
  },
  plugins: [
    tsconfigPaths(), // Adicione o plugin aqui
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});