import fs from 'fs';
import {defineConfig, Options} from 'tsup';

export default defineConfig((options) => {
  // Shared options among all outputs
  const commonOptions: Partial<Options> = {
    entry: {
      'react-plotly': 'src/react-plotly.ts',
      factory: 'src/factory.tsx',
    },
    sourcemap: true,
    splitting: false,
    ...options,
  };

  return [
    // Standard ESM
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({js: '.mjs'}),
      clean: true,
      dts: true,
      async onSuccess() {
        // Support Webpack 4 by pointing package.json `module` to a file with a `.js` extension
        fs.copyFileSync('dist/react-plotly.mjs', 'dist/react-plotly.legacy-esm.js');
      },
    },
    // Browser-ready ESM, production + minified
    {
      ...commonOptions,
      entry: {
        'react-plotly.broswer': 'src/react-plotly.mts',
        'factory.broswer': 'src/factory.tsx',
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      format: ['esm'],
      outExtension: () => ({js: '.mjs'}),
      minify: true,
    },
    {
      ...commonOptions,
      format: 'cjs',
      dts: true,
      outDir: './dist/cjs/',
      outExtension: () => ({js: '.cjs'}),
    },
  ];
});
