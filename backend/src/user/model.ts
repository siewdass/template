import { Model, INTEGER, STRING } from '../../lib/database';

export const User = Model('User',
  {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: STRING, allowNull: false },  
    email: { type: STRING, allowNull: false, unique: true },
  },
  {
    tableName: 'users',
    timestamps: true
  }
);