import { Sequelize, DataTypes } from 'sequelize';
export { Op } from 'sequelize';
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