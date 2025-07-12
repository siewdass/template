import { Request } from 'express'
import { Transaction } from 'sequelize'
import { Catalog } from './model'
import { Crud } from '../../lib/database'

// quizas un object con request transaction y response
// export default async function catalog(request: Request, transaction: Transaction) {
export default async (request: Request, transaction: Transaction) => {
  return await Crud({
    request,
    model: Catalog // pasar la transaction
  })
}