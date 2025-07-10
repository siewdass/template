import { Bootstrap } from '../lib/bootstrap'

export const app = Bootstrap({
  origin: '*',
  authorization: {
    exposed: [ '/', '/user/:id', '/user/createuser', '/user/getusers' ],
    secret: 'jd9812jd8912jd821jd21',
  }
})