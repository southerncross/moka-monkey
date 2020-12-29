import path from 'path';
import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const extensions = ['.ts'];

const resolve = function(...args) {
  return path.resolve(__dirname, ...args);
};

export default {
  input: resolve('./src/index.ts'),
  output: {
    file: resolve(pkg.main), // 为了项目的统一性，这里读取 package.json 中的配置项
    format: 'iife',
  },
  plugins: [
    nodeResolve({
      extensions,
      modulesOnly: true,
    }),
    babel({
      exclude: 'node_modules/**',
      extensions,
      babelHelpers: 'bundled',
    }),
  ],
};