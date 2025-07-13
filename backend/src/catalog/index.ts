import { Request } from 'express'
import { Transaction } from 'sequelize'

import { Crud } from '../../lib/database'
import { Catalog } from './model'

export default async (request: Request, transaction: Transaction) => {
  return await Crud({
    request,
    model: Catalog 
  })
}


// quizas un object con request transaction y response
// export default async function catalog(request: Request, transaction: Transaction) {
// pasar la transaction