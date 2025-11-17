import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'types/index': 'src/types/index.ts',
    'theme/index': 'src/theme/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'reactflow'],
  minify: false,
  sourcemap: true,
  target: 'es2020',
  platform: 'browser',
  treeshake: true,
  esbuildOptions: {
    jsx: 'automatic',
  },
});