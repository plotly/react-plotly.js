import {defineConfig} from 'tsup';

// Mirror browserify-global-shim: rewrite `import React from 'react'` as
// `module.exports = window.React` in the UMD bundle, so a <script>-loaded
// consumer can supply React via the global.
const externalReactAsGlobal = {
  name: 'external-react-as-global',
  setup(build) {
    build.onResolve({filter: /^react$/}, () => ({
      path: 'react',
      namespace: 'external-global',
    }));
    build.onLoad({filter: /.*/, namespace: 'external-global'}, () => ({
      contents: 'module.exports = window.React;',
      loader: 'js',
    }));
  },
};

export default defineConfig([
  // ESM + CJS for npm consumers. React, plotly.js, and prop-types stay external
  // so the consumer's bundler dedupes them.
  {
    entry: {
      index: 'src/react-plotly.js',
      factory: 'src/factory.js',
    },
    format: ['esm', 'cjs'],
    outExtension({format}) {
      return {js: format === 'esm' ? '.mjs' : '.cjs'};
    },
    sourcemap: true,
    clean: true,
    external: ['react', 'plotly.js', 'prop-types'],
    outDir: 'dist',
    loader: {'.js': 'jsx'},
  },
  // UMD / IIFE for <script>-tag consumers. React is taken from window.React
  // via the plugin above; plotly.js still external (consumer loads it the
  // same way and the wrapper grabs it off the global through Plotly itself).
  {
    entry: {'create-plotly-component': 'src/factory.js'},
    format: ['iife'],
    globalName: 'createPlotlyComponent',
    sourcemap: true,
    minify: true,
    outExtension: () => ({js: '.min.js'}),
    outDir: 'dist',
    esbuildPlugins: [externalReactAsGlobal],
    external: ['plotly.js'],
    loader: {'.js': 'jsx'},
  },
]);
