/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: 'vitest.setup.mjs',
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['html'],
    },
  },
});
