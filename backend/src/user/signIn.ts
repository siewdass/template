import { Request } from 'express';
import { User } from './model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function signUp(req: Request) {
  const { email, password } = req.body;
  
  if (!email || !password) throw { status: 400, error: 'Email and password are required' }; //zod

  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 401, error: 'Invalid credentials' }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, error: 'Invalid credentials' };
  
  const token = jwt.sign( { user }, 'jd9812jd8912jd821jd21', { expiresIn: '1h' } );

  return {
    data: { user, token },
    message: 'Login successful'
  };
}