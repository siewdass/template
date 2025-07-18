import { Sequelize, DataTypes, Model as M, ModelAttributes, ModelOptions, Options, ModelStatic, ModelAttributeColumnOptions, DataTypeAbstract } from 'sequelize';
// @ts-ignore
import sph from 'sequelize-paginate-helper';
import { Request } from 'express';

export const { INTEGER, STRING, DATE, BOOLEAN, TEXT, UUID, ARRAY, BIGINT } = DataTypes;

let database: Sequelize;

// Mapeo de tipos nativos a tipos de Sequelize
const typeMapping = {
  String: STRING,
  Number: INTEGER,
  Boolean: BOOLEAN,
  Date: DATE,
};

type NativeType = typeof String | typeof Number | typeof Boolean | typeof Date;

type CustomAttribute = Omit<ModelAttributeColumnOptions, 'type'> & {
  type?: NativeType | DataTypeAbstract | any;
  foreignKey?: () => ModelStatic<M>;
  belongsTo?: () => ModelStatic<M>;
  hasMany?: () => ModelStatic<M>;
  belongsToMany?: () => ModelStatic<M>;
  through?: string;
  otherKey?: string;
};

type CustomModelAttributes = {
  [key: string]: CustomAttribute;
};

type EntityOptions<T extends object> = Omit<ModelOptions, 'modelName'> & {
  assignTo?: (model: ModelStatic<M & T>) => void;
  seeds?: Record<string, any>[];
};

type DeferredModel = {
  name: string;
  attributes: CustomModelAttributes;
  options: ModelOptions & {
    assignTo?: (model: ModelStatic<M>) => void;
    seeds?: Record<string, any>[];
  };
  associations?: (() => void)[];
  foreignKeys?: { field: string; target: ModelStatic<M> | (() => ModelStatic<M>) }[];
};

const definitions: DeferredModel[] = [];

export function Model<T extends object>(
  name: string,
  attributes: CustomModelAttributes,
  options: EntityOptions<T> = {}
): ModelStatic<M & T> {
  let modelRef: ModelStatic<M & T> | undefined;

  const associations: (() => void)[] = [];
  const foreignKeys: DeferredModel['foreignKeys'] = [];
  const createdAliases = new Set<string>(); // Para evitar duplicados

  // Crear una copia de attributes para poder modificarla
  const processedAttributes = { ...attributes };

  for (const [field, attr] of Object.entries(processedAttributes)) {
    if (typeof attr !== 'object' || !attr) continue;

    const col = attr as CustomAttribute;

    // Mapear tipos nativos a tipos de Sequelize
    if (col.type === String || col.type === Number || col.type === Boolean || col.type === Date) {
      (col as any).type = typeMapping[col.type.name as keyof typeof typeMapping];
      
      // Por defecto, tipos nativos son NOT NULL a menos que se especifique allowNull: true
      if (col.allowNull === undefined) {
        col.allowNull = false;
      }
    }

    // Si tiene foreignKey, automáticamente crear belongsTo
    if (col.foreignKey) {
      const foreignKeyTarget = col.foreignKey; // Guardar la referencia antes de eliminarla
      foreignKeys.push({ field, target: foreignKeyTarget });
      
      // Foreign keys son nullable por defecto a menos que se especifique allowNull: false
      if (col.allowNull === undefined) {
        col.allowNull = true;
      }
      
      // Auto-crear belongsTo solo si no existe ya una asociación con ese alias
      const aliasName = field.replace(/Id$/, ''); // roleId -> role
      if (!createdAliases.has(aliasName)) {
        createdAliases.add(aliasName);
        associations.push(() => {
          const target = foreignKeyTarget();
          if (modelRef) {
            modelRef.belongsTo(target, { 
              foreignKey: field,
              as: aliasName
            });
          }
        });
      }
    }

    // Si solo tiene belongsTo (campo virtual de relación), no agregarlo a Sequelize
    if (col.belongsTo && !col.foreignKey) {
      const belongsToTarget = col.belongsTo; // Guardar la referencia
      // Es un campo virtual de relación, eliminarlo de los atributos de la DB
      delete processedAttributes[field];
      
      // Crear la asociación solo si no existe ya
      if (!createdAliases.has(field)) {
        createdAliases.add(field);
        associations.push(() => {
          const target = belongsToTarget();
          if (modelRef) {
            modelRef.belongsTo(target, { as: field });
          }
        });
      }
      continue;
    }

    // Si tiene hasMany, crear la asociación
    if (col.hasMany) {
      const hasManyTarget = col.hasMany; // Guardar la referencia
      const foreignKeyName = col.foreignKey ? field : undefined;
      // Es un campo virtual de relación, eliminarlo de los atributos de la DB
      delete processedAttributes[field];
      
      if (!createdAliases.has(field)) {
        createdAliases.add(field);
        associations.push(() => {
          const target = hasManyTarget();
          if (modelRef) {
            modelRef.hasMany(target, { 
              foreignKey: foreignKeyName || field + 'Id', 
              as: field 
            });
          }
        });
      }
      continue;
    }

    // Si tiene belongsToMany, crear la asociación
    if (col.belongsToMany) {
      const belongsToManyTarget = col.belongsToMany; // Guardar la referencia
      const throughTable = col.through;
      const otherKey = col.otherKey;
      // Es un campo virtual de relación, eliminarlo de los atributos de la DB
      delete processedAttributes[field];
      
      if (!createdAliases.has(field)) {
        createdAliases.add(field);
        associations.push(() => {
          const target = belongsToManyTarget();
          if (modelRef && throughTable) {
            modelRef.belongsToMany(target, { 
              through: throughTable,
              foreignKey: name.toLowerCase() + 'Id',
              otherKey: otherKey || target.name.toLowerCase() + 'Id',
              as: field 
            });
          }
        });
      }
      continue;
    }

    // Limpiar las propiedades customizadas que no son de Sequelize
    if (col.foreignKey) delete (col as any).foreignKey;
    if (col.belongsTo) delete (col as any).belongsTo;
    if (col.hasMany) delete (col as any).hasMany;
    if (col.belongsToMany) delete (col as any).belongsToMany;
    if (col.through) delete (col as any).through;
    if (col.otherKey) delete (col as any).otherKey;
  }

  definitions.push({
    name,
    attributes: processedAttributes,
    options: {
      ...options,
      assignTo: (model: ModelStatic<M>) => {
        modelRef = model as ModelStatic<M & T>;
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

  return new Proxy(function () {}, handler) as unknown as ModelStatic<M & T>;
}

export const Connect = async (options: Options) => {
  try {
    database = new Sequelize(options);
    await database.authenticate();

    for (const def of definitions) {
      const model = database.define(def.name, def.attributes as ModelAttributes, def.options);
      def.options?.assignTo?.(model);
    }

    // set references for foreign keys AFTER models are defined
    for (const def of definitions) {
      if (def.foreignKeys) {
        for (const fk of def.foreignKeys) {
          const target = (typeof fk.target === 'function'
            ? (fk.target as () => ModelStatic<M>)()
            : fk.target) as ModelStatic<M>;
          
          // Get the actual model from the database
          const model = database.model(def.name);
          
          // This modifies the Sequelize model's attribute to add references
          if (model.rawAttributes && model.rawAttributes[fk.field]) {
            model.rawAttributes[fk.field].references = { 
              model: target.getTableName(), 
              key: 'id' 
            };
          }
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
  const  { data, totalRecords } = await sph(model, page, limit, order, sort, attributes, where, filters, includes, 'id')
  return { items: data, total: totalRecords }
}

interface Crud {
  request: Request
  model: any
}

// quizas renta solo pasar body y query asi no depende de express
export const Crud = async ({ request, model }: Crud) => {
  const { body, query } = request
  const { id, page = 1, limit, ...filters } = query

  switch (request.method) {
    case 'GET':
      if (id) return await model.findByPk(Number(id))

      if (page && limit) {
        const { data, totalRecords } = await sph(
          model, page, limit, undefined, undefined, undefined, {}, {}, [], 'id'
       )
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