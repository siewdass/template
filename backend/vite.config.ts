import { defineConfig } from 'vite'
import { expressHmr } from './lib/plugin'
import path from 'path';

export default defineConfig({
  plugins: [
    expressHmr()
  ],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
