import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import pkg from './package.json'

const includes = new Set(['@pancakeswap/uikit', '@pancakeswap/hooks', '@pancakeswap/localization'])

const externals = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies), 'crypto'].filter(
  (x) => !includes.has(x),
)
console.log(externals)
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [...externals, 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-is'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM', 'react/jsx-runtime': 'ReactJsxRuntime' },
      },
    },
    outDir: 'dist',
  },
  plugins: [
    vanillaExtractPlugin({
      identifiers: 'short',
    }),
    dts(),
  ],
})
