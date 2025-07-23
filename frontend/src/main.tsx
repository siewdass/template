import { Bootstrap } from '@lib/bootstrap'
import { Layout } from './layout'

import './style.css'

const env = (import.meta as any).env

export const app = Bootstrap({
	layout: {
		excluded: [ '/', '/user/signin', '/user/signup', '/test' ],
		element: Layout 
	},
	apiUrl: env.VITE_API_URL,
	authorization: {
		endpoint: '/user/signin',
		redirect: {
			onlogin: '/tablet',
			onlogout: '/user/signin'
		}
	}
})
