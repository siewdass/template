import { Sequelize, DataTypes } from 'sequelize';
export { Op } from 'sequelize';

export const { INTEGER, STRING, DATE, BOOLEAN, TEXT, UUID, ARRAY, BIGINT } = DataTypes

export const database = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false 
});

export const Model = database.define.bind(database)

export async function connect() {
  try {
    await database.authenticate();
    await database.sync();
  } catch (error) {
    console.log(error);
  }
}
