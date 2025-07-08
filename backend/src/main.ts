import { Bootstrap } from '../lib/bootstrap'

export const app = Bootstrap({
  origin: '*',
  open: [ '/', '/user/:id', '/user/createuser', '/user/getusers' ],
  secret: 'jd9812jd8912jd821jd21'
})