import { Bootstrap } from '../lib/bootstrap'

export const app = Bootstrap({
  origin: '*',
  authorization: {
    exposed: [ '/', '/user/signin', '/user/signup' ],
    secret: 'jd9812jd8912jd821jd21',
  },
  database: {
    dialect: 'sqlite',
    storage: 'database.sqlite'
  }
})