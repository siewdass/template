import { Sequelize, DataTypes, Model, ModelAttributes, ModelOptions, Options, ModelStatic, ModelAttributeColumnOptions, DataTypeAbstract } from 'sequelize';
import sph from 'sequelize-paginate-helper';
import { Request } from 'express';

export const { INTEGER, STRING, DATE, BOOLEAN, TEXT, UUID, ARRAY, BIGINT } = DataTypes;

let database: Sequelize;

type CustomAttribute = ModelAttributeColumnOptions & {
  foreignKey?: () => ModelStatic<Model>;
  belongsTo?: () => ModelStatic<Model>;
  hasMany?: () => ModelStatic<Model>;
};

type CustomModelAttributes = {
  [key: string]: DataTypeAbstract | CustomAttribute;
};

type EntityOptions<T extends object> = Omit<ModelOptions, 'modelName'> & {
  assignTo?: (model: ModelStatic<Model & T>) => void;
  seeds?: Record<string, any>[];
};

type DeferredModel = {
  name: string;
  attributes: CustomModelAttributes;
  options: ModelOptions & {
    assignTo?: (model: ModelStatic<Model>) => void;
    seeds?: Record<string, any>[];
  };
  associations?: (() => void)[];
  foreignKeys?: { field: string; target: ModelStatic<Model> | (() => ModelStatic<Model>) }[];
};

const definitions: DeferredModel[] = [];

export function Entity<T extends object>(
  name: string,
  attributes: CustomModelAttributes,
  options: EntityOptions<T> = {}
): ModelStatic<Model & T> {
  let modelRef: ModelStatic<Model & T> | undefined;

  const associations: (() => void)[] = [];
  const foreignKeys: DeferredModel['foreignKeys'] = [];

  for (const [field, attr] of Object.entries(attributes)) {
    if (typeof attr !== 'object' || !attr) continue;

    const col = attr as CustomAttribute;

    if (col.foreignKey) {
      foreignKeys.push({ field, target: col.foreignKey! });
    }

    if (col.belongsTo) {
      associations.push(() => {
        const target = col.belongsTo!(); // now guaranteed callable
        if (modelRef) modelRef.belongsTo(target, { foreignKey: field, as: field.replace(/Id$/, '') });
      });
    }

    if (col.hasMany) {
      associations.push(() => {
        const target = col.hasMany!(); // also guaranteed callable
        if (modelRef) modelRef.hasMany(target, { foreignKey: field, as: field + 's' });
      });
    }
  }

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
    associations,
    foreignKeys,
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

    // set references for foreign keys AFTER models are defined
    for (const def of definitions) {
      if (def.foreignKeys) {
        for (const fk of def.foreignKeys) {
          const target = (typeof fk.target === 'function'
            ? (fk.target as () => ModelStatic<Model>)()
            : fk.target) as ModelStatic<Model>;          // This modifies the Sequelize model's attribute to add references
          const attr = def.attributes[fk.field] as any;
          attr.references = { model: target.getTableName(), key: 'id' };
        }
      }
    }

    // run associations AFTER references set
    for (const def of definitions) {
      def.associations?.forEach((fn) => fn());
    }

    await database.sync();

    for (const def of definitions) {
      const model = database.model(def.name);
      const seeds = def.options?.seeds;
      if (Array.isArray(seeds)) {
        for (const seed of seeds) {
          await model.findOrCreate({ where: seed, defaults: seed });
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
  }
  return database;
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