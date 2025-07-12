import { Sequelize, DataTypes, Op, ModelStatic } from 'sequelize';
import sph from 'sequelize-paginate-helper'
import { Request } from 'express'

export const { INTEGER, STRING, DATE, BOOLEAN, TEXT, UUID, ARRAY, BIGINT } = DataTypes

export const database = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false 
})

export const Model = database.define.bind(database)

interface Pagination {
  request: Request
  model: any
  page?: number
  limit?: number 
  order?: string
  sort?: 'ASC' | 'DESC'
  attributes?: string[]
  where?: Record<string, unknown>
  filters?: { filterKey: string; operation: string; value: unknown }[]
  includes?: any[]
}

export const Paginate = async (options: Pagination) => {
  const { model, request, order, attributes, sort, where, filters, includes } = options
  const { page = 1, limit = 10 }: any = request.query;
  const p = await sph(model, page, limit, order, sort, attributes, where, filters, includes, 'id')
  return { items: p.data, total: p.totalRecords }
}

export const Connect = async () => {
  try {
    await database.authenticate();
    await database.sync();
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
}

interface Crud {
  request: Request
  model: any
}

// quizas renta solo pasar body y query asi no depende de express
export const Crud = async ({ request, model }: Crud) => {
  const { body, query } = request
  const { id, page, limit, ...filters } = query

  switch (request.method) {
    case 'GET':
      if (id) return await model.findByPk(Number(id))

      if (page && limit) {
        const { data, totalRecords } = await sph.paginate(model, {
          page: Number(page),
          limit: Number(limit),
          where: filters
        })

        return { items: data, total: totalRecords }
      }

      const items = await model.findAll({ where: filters })
      return { items, total: items.length }

    case 'POST':
      return await model.create(body)

    case 'PUT':
      if (!id) throw { status: 400, message: 'Id is required' }
      await model.update(body, { where: { id } })
      return { message: `Updated ${id}` }

    case 'DELETE':
      if (!id) throw { status: 400, message: 'Id is required' }
      await model.destroy({ where: { id } })
      return { message: `Deleted ${id}` }

    default:
      throw { status: 405, message: 'Method Not Allowed' }
  }
}