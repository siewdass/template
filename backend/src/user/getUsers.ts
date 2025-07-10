import { Request } from 'express'
import { User } from './model'
import { Paginate } from '../../lib/database'

export default async function GetUsers(request: Request) {
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