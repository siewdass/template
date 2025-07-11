import { Request } from 'express';
import { User } from './model';
import bcrypt from 'bcrypt';

export default async function signIn(req: Request) {
  const { name, email, password } = req.body;
  
  // Basic validation
  if (!name || !email || !password) {
    throw { status: 400, error: 'Name, email and password are required' };
  }

  // Check if user exists
  const exist = await User.findOne({ where: { email } });
  if (exist) {
    throw { status: 400, message: 'User already exists' };
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with hashed password
  await User.create({ name, email, password: hashedPassword });

  return { 
    message: 'User created successfully',
    data: { name, email } // Never return password
  };
}