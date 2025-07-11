import { Bootstrap } from '../lib/bootstrap';
import { Layout } from './layout';
import './style.css'

export const app = Bootstrap({
	layout: Layout,
	authorization: {
    exposed: ['/'] // redirect
  }
})
//'http://localhost:3001' environment variables