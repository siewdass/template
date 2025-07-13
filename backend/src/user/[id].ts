import { Request } from 'express'

export default async (req: Request ) => {
  const { id } = req.params
  
  return {
    message: `User ${id} retrieved successfully`
  }
}