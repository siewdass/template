import { Request } from 'express'
import { User } from './model'
import { Op, STRING, DATE } from '../util/database'
import { logger } from '../util/logger';

export default async function GetUsers(req: Request) {

  const { page, limit, filter }: any = req.query;

  const where: any = { }

  if ( filter ) {
    const attrs = User.getAttributes()

    where[Op.or] = Object.keys(attrs).reduce((acc, key) => {
      if ([ 'id', 'createdAt', 'updatedAt' ].includes(key)) return acc;

      if (attrs[key] instanceof STRING) acc[key] = { [Op.like]: `%${filter}%` };
      
      if (attrs[key] instanceof DATE) {
        const parsed = new Date(filter);
        if (!isNaN(parsed.getTime())) acc[key] = parsed;
      }

      return acc;
    }, {} as Record<string, any>);
  }

  const users = await User.findAndCountAll({ where, offset: (page - 1) * limit, limit })

  return {
    data: {
      items: users.rows,
      total: users.count,
      pages: Math.ceil(users.count / limit),
      page: Number(page)
    },
    message: 'Paginated Users Retrieved Successfully',
  }

}