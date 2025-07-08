import { Request } from 'express'

export default async function User(req: Request) {
  const { id } = req.params
  
  return {
    message: `User ${id} retrieved successfully`
  }
}