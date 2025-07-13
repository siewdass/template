import { Entity, INTEGER, STRING } from '../../lib/database';

export interface ICatalog {
  id: number;
  name: string;
  code: string;
  type: string;
}

export const Catalog = Entity<ICatalog>(
  'Catalog',
  {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: STRING, allowNull: false },  
    code: { type: STRING, allowNull: false },
    type: { type: STRING, allowNull: false },
  },
  { tableName: 'catalog' }
)