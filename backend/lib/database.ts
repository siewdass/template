import { Sequelize, DataTypes, Model, ModelAttributes, ModelOptions, Options, ModelStatic } from 'sequelize';
import sph from 'sequelize-paginate-helper';
import { Request } from 'express';

export const { INTEGER, STRING, DATE, BOOLEAN, TEXT, UUID, ARRAY, BIGINT } = DataTypes;

let database: Sequelize;
export const getDatabase = () => database;

type DeferredModel = {
  name: string;
  attributes: ModelAttributes;
  options: ModelOptions & {
    assignTo?: (model: ModelStatic<Model>) => void;
  };
};

const definitions: DeferredModel[] = [];

export function Entity<T extends object>(
  name: string,
  attributes: ModelAttributes,
  options: ModelOptions & { assignTo?: (model: ModelStatic<Model & T>) => void } = {}
): ModelStatic<Model & T> {
  let modelRef: ModelStatic<Model & T> | undefined;

  definitions.push({
    name,
    attributes,
    options: {
      ...options,
      assignTo: (model: ModelStatic<Model>) => {
        modelRef = model as ModelStatic<Model & T>;
        options.assignTo?.(modelRef);
      },
    },
  });

  const handler: ProxyHandler<any> = {
    get(_, prop) {
      if (!modelRef) throw new Error(`Model "${name}" not initialized. Call Connect() first.`);
      return Reflect.get(modelRef, prop);
    },
    construct(_, args) {
      if (!modelRef) throw new Error(`Model "${name}" not initialized. Call Connect() first.`);
      return new (modelRef as any)(...args);
    },
  };

  return new Proxy(function () {}, handler) as unknown as ModelStatic<Model & T>;
}

export const Connect = async (options: Options) => {
  try {
    database = new Sequelize(options);

    await database.authenticate();

    for (const def of definitions) {
      const model = database.define(def.name, def.attributes, def.options);
      def.options?.assignTo?.(model);
    }

    await database.sync();
    console.log('✅ DB connected and models initialized');
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
  }
  return database
};

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