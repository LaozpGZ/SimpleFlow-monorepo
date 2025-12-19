/* eslint-disable no-param-reassign */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), vanillaExtractPlugin(), tsconfigPaths()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        components: path.resolve(__dirname, './src/components'),
        hooks: path.resolve(__dirname, './src/hooks'),
        utils: path.resolve(__dirname, './src/utils'),
        state: path.resolve(__dirname, './src/state'),
        views: path.resolve(__dirname, './src/views'),
        config: path.resolve(__dirname, './src/config'),
        quoter: path.resolve(__dirname, './src/quoter'),
        wallet: path.resolve(__dirname, './src/wallet'),
        style: path.resolve(__dirname, './src/style'),
        // Mock Next.js imports for Vite
        'next/image': path.resolve(__dirname, './src/mocks/next-image.tsx'),
        'next/legacy/image': path.resolve(__dirname, './src/mocks/next-image.tsx'),
        'next/link': path.resolve(__dirname, './src/mocks/next-link.tsx'),
        'next/router': path.resolve(__dirname, './src/mocks/next-router.ts'),
        'next/server': path.resolve(__dirname, './src/mocks/next-server.ts'),
        // Node.js polyfills
        buffer: 'buffer',
        querystring: 'querystring-es3',
      },
    },
    optimizeDeps: {
      include: ['@solana/wallet-adapter-wallets', 'buffer'],
    },
    define: {
      global: 'globalThis',
      'process.env.NEXT_PUBLIC_EDGE_ENDPOINT': JSON.stringify('https://pancakeswap.finance'),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || mode || 'development'),
      // Pass through all NEXT_PUBLIC_ environment variables
      ...Object.keys(env).reduce((acc, key) => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          acc[`process.env.${key}`] = JSON.stringify(env[key])
        }
        return acc
      }, {} as Record<string, string>),
    },
    server: {
      port: 3001,
      host: true,
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  }
})
