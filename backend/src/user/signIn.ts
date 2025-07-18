import { Request } from 'express';
import { User } from './user';
import { Role } from './role'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async (req: Request ) => {
  const { email, password } = req.body;
  
  if (!email || !password) throw { status: 400, error: 'Email and password are required' }; //zod

  const user = await User.findOne({ where: { email }, include: [ { model: Role, as: "role"  } ], });
  if (!user) throw { status: 401, error: 'Invalid credentials' }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, error: 'Invalid credentials' };
  
  const token = jwt.sign( { user }, 'jd9812jd8912jd821jd21', { expiresIn: '1h' } ); // quizas deba pasar a auth

  return {
    data: { user, token },
    message: 'Login successful'
  };
}

