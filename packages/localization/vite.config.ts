import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import pkg from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.tsx',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.peerDependencies),
        ...Object.keys(pkg.dependencies),
        'crypto',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-is',
      ],
    },
  },
  plugins: [dts()],
})
