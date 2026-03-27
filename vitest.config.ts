import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
  },
  plugins: [
    // Necessário para o NestJS entender os Decorators com SWC
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});