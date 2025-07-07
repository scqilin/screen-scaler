import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: false, // 禁用 sourcemap 减少文件
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: false // 禁用 sourcemap 减少文件
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'ScreenScaler',
        sourcemap: false, // 禁用 sourcemap 减少文件
        globals: {}
      }
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: false // 禁用第一个配置的 sourcemap
      })
    ],
    external: []
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.min.js',
        format: 'umd',
        name: 'ScreenScaler',
        sourcemap: false, // 禁用压缩版的 sourcemap
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: false // 禁用第二个配置的 sourcemap
      })
    ],
    external: []
  }
];
