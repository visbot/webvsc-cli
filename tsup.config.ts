import { defineConfig } from 'tsup';

export default defineConfig({
	target: 'esnext',
  clean: true,
  dts: true,
  entry: ['src/cli.ts'],
  format: 'esm',
  minify: true,
  outDir: 'bin',
  treeshake: 'recommended'
});
