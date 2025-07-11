import { Model, INTEGER, STRING } from '../../lib/database';

export const User = Model<any>('User',
  {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: STRING, allowNull: false },  
    email: { type: STRING, allowNull: false, unique: true },
    password: { type: STRING, allowNull: false },
  },
  {
    tableName: 'users',
    timestamps: true
  }
);