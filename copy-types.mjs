import fs from 'fs';
// Copy types as `d.ts` files
fs.copyFileSync('dist/cjs/react-plotly.d.ts', 'dist/react-plotly.d.ts');
fs.copyFileSync('dist/cjs/factory.d.ts', 'dist/factory.d.ts');
