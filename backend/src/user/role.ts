// models/Role.ts
import { INTEGER, STRING, Entity } from '../../lib/database';

export interface IRole {
  id: number;
  name: string;
}

export const Role = Entity<IRole>(
  'Role',
  {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: STRING, allowNull: false, unique: true },
  },
  {
    tableName: 'roles',
    timestamps: false,
		seeds: [{ name: 'admin' }]
  }
)