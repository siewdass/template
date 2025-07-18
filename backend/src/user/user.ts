import { Model } from '../../lib/database';
import { Role } from './role'

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

export const User = Model<IUser>(
  'User',
  {
    id: { type: Number, autoIncrement: true, primaryKey: true },
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    roleId: { type: Number, foreignKey: () => Role }
  },
  {
    tableName: 'users',
    timestamps: true,
  }
)