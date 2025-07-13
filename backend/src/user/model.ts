import { INTEGER, STRING, Entity } from '../../lib/database';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

export const User = Entity<IUser>(
  'User',
  {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: STRING, allowNull: false },
    email: { type: STRING, allowNull: false, unique: true },
    password: { type: STRING, allowNull: false },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);
