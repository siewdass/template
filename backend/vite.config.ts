import { defineConfig } from 'vite'
import { expressHmr } from './lib/plugin'
import path from 'path'

export default defineConfig({
	plugins: [
		expressHmr()
	],
	server: {
		port: 3001,
	},
	resolve: {
		alias: {
			'@lib': path.resolve(__dirname, './lib'),  
			'@models': path.resolve(__dirname, './src/models'),  
		},
	}
})
