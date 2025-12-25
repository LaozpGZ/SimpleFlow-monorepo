/* eslint-disable no-param-reassign */
import { defineConfig } from 'tsup'
import { exec } from 'child_process'

export default defineConfig((options) => ({
  entry: {
    evm: 'evm/index.ts',
    'legacy-router': 'legacy-router/index.ts',
  },
  format: ['esm', 'cjs'],
  skipNodeModulesBundle: true,
  // 移除 noExternal，让 utils 保持 external
  dts: false,
  treeshake: true,
  splitting: true,
  clean: !options.watch,
  esbuildOptions(opts) {
    opts.loader = {
      ...opts.loader,
      '.ts': 'ts',
    }
  },
  onSuccess: async () => {
    exec('tsc --emitDeclarationOnly --declaration', (err, stdout) => {
      if (err) {
        console.error(stdout)
        if (!options.watch) {
          process.exit(1)
        }
      }
    })
  },
}))
