import { VitePluginNode } from 'vite-plugin-node';

import type { PluginOption } from 'vite'

export function expressHmr(): PluginOption {
  return [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/main.ts',
      exportName: 'app',
      tsCompiler: 'esbuild',
      initAppOnBoot: true
    }),
    {
      name: 'express-hmr-logger',
      apply: 'serve',
      configureServer(server) {
        server.watcher.on('change', (p) => {
          server.config.logger.info(
            `(server) \x1b[32mhmr update\x1b[0m ${p.replace(server.config.root, '')}`,
            { timestamp: true }
          )
        })
      }
    }
  ]
}