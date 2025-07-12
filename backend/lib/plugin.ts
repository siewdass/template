import { VitePluginNode } from 'vite-plugin-node';
import type { PluginOption } from 'vite'
import VitePluginRestart from 'vite-plugin-restart'

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
        server.watcher.on('all', (event,p) => {
          server.config.logger.info(
            `(server) \x1b[32mhmr ${event}\x1b[0m ${p.replace(server.config.root, '')}`,
            { timestamp: true }
          )
        })
      }
    },
    VitePluginRestart({
      restart: [
        'src/**',
      ]
    }),
  ]
} // mejor que express este metido aqui y no plugins 