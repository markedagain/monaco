import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  external: [
    'monaco-editor',
    'monaco-sql-languages',
    /^monaco-editor\//,
    /^monaco-sql-languages\//
  ],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'es'
    }
  ],
  plugins: [
    resolve({
      preferBuiltins: false
    }),
    commonjs(),
    terser()
  ]
};