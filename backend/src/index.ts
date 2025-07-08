import { Request } from 'express';

export default async function Endpoint(req: Request) {
 
  return {
    data: { },
    message: 'Hello World'
  }
}