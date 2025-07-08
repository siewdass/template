import { Request } from 'express';
import { User } from './model'

export default async function CreateUser(req: Request) {

  const { name, email } = req.body;
  if (!name || !email) throw { status: 400, error: 'Faltan campos' }
  
  const exist = await User.findOne({ where: { email } });
  if (exist) throw { status: 400, message: 'Ya existe' }
  
  const newUser = await User.create({ name, email });

  return {
    data: newUser,
    message: 'User Created Successfully',
  }

}