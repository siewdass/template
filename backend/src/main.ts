import { Bootstrap } from '../lib/bootstrap'
import { logger } from '../lib/logger'

logger.info('check info', { id: 1, name: 'Ejemplo' })
logger.warn('just warn', { id: 1, name: 'Ejemplo' })
logger.error('an error', { id: 1, name: 'Ejemplo' })

const env = (import.meta as any).env

export const app = Bootstrap({
	origin: '*',
	authorization: {
		exposed: [ '/', '/user/signin', '/user/signup', '/user/recover' ],
		secret: env.VITE_SECRET_TOKEN,
	},
	database: {
		dialect: 'sqlite',
		storage: 'database.sqlite'
	},
	mail: {
		service: 'gmail',
		user: env.VITE_MAIL_USER,
		pass: env.VITE_MAIL_PASSWORD
	}
})