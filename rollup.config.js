import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const defaults = {
  external: [  ],
  output: {
    file: 'bin/cli.mjs',
    format: 'esm'
  },
  plugins: [
    commonjs(),
    json(),
    nodeResolve(),
    typescript()
  ]
};

export default {
  ...defaults,
  input: 'src/main.ts'
};
