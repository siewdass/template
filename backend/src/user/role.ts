// models/Role.ts
import { Model } from '../../lib/database'

export interface IRole {
  id: number;
  name: string;
}

export const Role = Model<IRole>(
	'Role',
	{
		id: { type: Number, autoIncrement: true, primaryKey: true },
		name: { type: String, unique: true },
	},
	{
		tableName: 'roles',
		timestamps: false,
		seeds: [ { name: 'admin' } ]
	}
)