import { Bootstrap } from '../lib/bootstrap';
import { Layout } from './layout';
import './style.css'

export const app = Bootstrap({
	layout: {
		excluded: ['/', '/user/signin', '/user/signup', '/test'],
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

//'http://localhost:3001' environment variables
