import { Bootstrap } from '../lib/bootstrap'
import { Layout } from './layout'
import { logger } from '../lib/logger'
import './style.css'

logger.info('check info', { id: 1, name: 'Ejemplo' })
logger.warn('just warn', { id: 1, name: 'Ejemplo' })
logger.error('an error', { id: 1, name: 'Ejemplo' })

export const app = Bootstrap({
	layout: {
		excluded: [ '/', '/user/signin', '/user/signup', '/test' ],
		element: Layout 
	},
	authorization: {
		endpoint: '/user/signin',
		redirect: {
			onlogin: '/tablet',
			onlogout: '/user/signin'
		}
	}
})
