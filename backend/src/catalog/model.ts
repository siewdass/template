import { Model, INTEGER, STRING } from '../../lib/database';

export const Catalog = Model<any>('Catalog',
  {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: STRING, allowNull: false },  
    code: { type: STRING, allowNull: false },
    type: { type: STRING, allowNull: false },
  },
  { tableName: 'catalog' }
)