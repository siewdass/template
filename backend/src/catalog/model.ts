import { Model } from '../../lib/database';

export interface ICatalog {
  id: number;
  name: string;
  code: string;
  type: string;
}

export const Catalog = Model<ICatalog>(
  'Catalog',
  {
    id: { type: Number, autoIncrement: true, primaryKey: true },
    name: { type: String },  
    code: { type: String },
    type: { type: String },
  },
  { tableName: 'catalog' }
)