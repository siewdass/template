import { Request } from 'express'
import { User } from './user'
import { Paginate } from '../../lib/database'

export default async (request: Request) => {
  return await Paginate({
    model: User,
    request,
    order: 'id',
    sort: 'ASC',
    attributes: [],
    where: {},
    filters: [],
    includes: []
  });
}